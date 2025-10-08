import { useEffect, useState } from "react";
import { getAccountTree } from "../../services/coaService";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronRight,
  Search,
  PiggyBank,
  Wallet,
  TrendingUp,
  Receipt,
  CreditCard,
  Landmark,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CoaTree() {
  const [treeData, setTreeData] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // 🔹 Load tree data
  useEffect(() => {
    (async () => {
      try {
        const res = await getAccountTree();
        if (res.data.success) {
          const accounts = res.data.data.accounts;
          const map = {};
          const roots = [];

          accounts.forEach((a) => (map[a.ACCOUNT_ID] = { ...a, children: [] }));
          accounts.forEach((a) => {
            if (a.PARENT_ACCOUNT_ID && map[a.PARENT_ACCOUNT_ID]) {
              map[a.PARENT_ACCOUNT_ID].children.push(map[a.ACCOUNT_ID]);
            } else {
              roots.push(map[a.ACCOUNT_ID]);
            }
          });
          setTreeData(roots);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 🔹 Toggle expand/collapse
  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // 🔹 Expand / Collapse All
  const handleExpandAll = () => {
    const all = {};
    const markAll = (nodes) => {
      nodes.forEach((n) => {
        all[n.ACCOUNT_ID] = true;
        if (n.children?.length) markAll(n.children);
      });
    };
    markAll(treeData);
    setExpanded(all);
  };
  const handleCollapseAll = () => setExpanded({});

  // 🔹 Type-based icon & color
  const getIcon = (type) => {
    switch (type?.toUpperCase()) {
      case "ASSET":
        return <Wallet className="text-green-600" size={16} />;
      case "LIABILITY":
        return <CreditCard className="text-red-600" size={16} />;
      case "INCOME":
        return <TrendingUp className="text-blue-600" size={16} />;
      case "EXPENSE":
        return <Receipt className="text-orange-600" size={16} />;
      case "EQUITY":
        return <Landmark className="text-purple-600" size={16} />;
      default:
        return <PiggyBank className="text-gray-600" size={16} />;
    }
  };

  // 🔹 Filter Tree by search
  const filterTree = (nodes) => {
    if (!searchTerm.trim()) return nodes;
    const match = (n) =>
      n.ACCOUNT_NAME.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.ACCOUNT_CODE?.toLowerCase().includes(searchTerm.toLowerCase());

    return nodes
      .map((n) => {
        const filteredChildren = filterTree(n.children || []);
        if (match(n) || filteredChildren.length > 0)
          return { ...n, children: filteredChildren };
        return null;
      })
      .filter(Boolean);
  };

  // 🔹 Recursive render
  const renderTree = (nodes) => (
    <ul className="pl-4">
      <AnimatePresence>
        {nodes.map((node) => (
          <motion.li
            key={node.ACCOUNT_ID}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="my-1"
          >
            <div
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 rounded px-2 py-1"
              onClick={() => toggleExpand(node.ACCOUNT_ID)}
            >
              {node.children.length > 0 ? (
                expanded[node.ACCOUNT_ID] ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )
              ) : (
                <span className="w-4" />
              )}

              {getIcon(node.ACCOUNT_TYPE)}

              <span className="font-medium text-gray-800">
                {node.ACCOUNT_NAME}
              </span>
              <span className="text-gray-500 text-sm">
                ({node.ACCOUNT_CODE})
              </span>

              <span
                className={`ml-auto text-xs px-2 py-1 rounded ${
                  node.STATUS === "A"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {node.ACCOUNT_TYPE}
              </span>
            </div>

            {node.children.length > 0 && expanded[node.ACCOUNT_ID] && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="pl-5 border-l border-gray-300"
              >
                {renderTree(node.children)}
              </motion.div>
            )}
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );

  const filteredData = filterTree(treeData);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">
          Chart of Accounts Tree
        </h1>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate("/accounts")}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            ← Back to List
          </button>
          <button
            onClick={handleExpandAll}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Expand All
          </button>
          <button
            onClick={handleCollapseAll}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Collapse All
          </button>
        </div>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
        <input
          type="text"
          placeholder="Search account..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border border-gray-300 rounded pl-9 pr-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
        />
      </div>

      <div className="bg-white shadow rounded p-4">
        {loading ? (
          <p className="text-gray-500">Loading tree...</p>
        ) : filteredData.length > 0 ? (
          renderTree(filteredData)
        ) : (
          <p className="text-gray-500">No accounts found.</p>
        )}
      </div>
    </div>
  );
}
