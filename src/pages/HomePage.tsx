import { useState, useMemo, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { toolsRegistry } from "../config/tools-registry";
import { getIcon } from "../layout/icons";

export function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchFromUrl = searchParams.get("search") || "";
  const [searchQuery, setSearchQuery] = useState(searchFromUrl);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (value.trim()) {
      setSearchParams({ search: value });
    } else {
      setSearchParams({});
    }
  };

  // Keyboard shortcut: press "/" to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const effectiveSearchQuery = searchFromUrl || searchQuery;

  const filteredTools = useMemo(() => {
    if (!effectiveSearchQuery.trim()) return toolsRegistry;
    const query = effectiveSearchQuery.toLowerCase();
    return toolsRegistry.filter(
      (tool) =>
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query)
    );
  }, [effectiveSearchQuery]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Developer Utility Toolkit</h1>
        <p className="text-gray-600 mt-2">
          A collection of {toolsRegistry.length} useful {toolsRegistry.length === 1 ? "tool" : "tools"} for developers. Select a tool to get started.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search tools... (press / to focus)"
          value={effectiveSearchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Tool Grid */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {effectiveSearchQuery.trim()
            ? `${filteredTools.length} ${filteredTools.length === 1 ? "result" : "results"} found`
            : "All Tools"}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTools.map((tool) => {
            const Icon = getIcon(tool.icon);
            return (
              <Link
                key={tool.slug}
                to={`/tools/${tool.slug}`}
                className="block bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{tool.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {filteredTools.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No tools found matching "{effectiveSearchQuery}"</p>
        </div>
      )}
    </div>
  );
}
