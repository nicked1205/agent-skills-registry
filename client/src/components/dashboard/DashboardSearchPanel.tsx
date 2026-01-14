import type { TagT } from "../../types";

type Props = {
  open: boolean;
  searchName: string;
  setSearchName: (s: string) => void;

  tagSearch: string;
  setTagSearch: (s: string) => void;
  selectedTags: string[];
  setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>;

  availableTags: TagT[];
  tagFilterOpen: boolean;
  setTagFilterOpen: (b: boolean) => void;
  tagDropdownRef: React.RefObject<HTMLDivElement | null>;

  onApply: () => void;
  onClear: () => void;
};

export default function DashboardSearchPanel({
  open,
  searchName,
  setSearchName,

  tagSearch,
  setTagSearch,
  selectedTags,
  setSelectedTags,

  availableTags,
  tagFilterOpen,
  setTagFilterOpen,
  tagDropdownRef,

  onApply,
  onClear,
}: Props) {
  const MAX_TAG_FILTERS = 5;

  return (
    <div
      className={`transition-all duration-300 ease-in-out ${
        open ? "max-h-40 opacity-100 mb-4" : "max-h-0 opacity-0"
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center gap-4 p-1">
        {/* Name search */}
        <input
          type="text"
          placeholder="search filename"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="w-full md:flex-1 input-glitch-green"
        />
        <div className="flex items-center gap-3 justify-between">
          {/* Tag filter toggle */}
          <div ref={tagDropdownRef} className="relative md:mr-6">
            <button
              onClick={() => setTagFilterOpen(!tagFilterOpen)}
              className={`btn-glitch-green-2`}
            >
              filter tags
            </button>

            {/* Tag filter dropdown */}
            {tagFilterOpen && (
              <div className="absolute z-10 md:-translate-x-1/2 md:left-1/2 mt-2 w-50 border border-zinc-800 bg-zinc-950 p-3">
                {/* Tag Search */}
                <input
                  value={tagSearch}
                  onChange={(e) => setTagSearch(e.target.value)}
                  placeholder="search tags"
                  className="mb-2 w-full input-glitch-green"
                />

                <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-1 text-xs sm:text-sm items-center">
                  {availableTags.length === 0 && (
                    <div className="text-zinc-400 text-center">
                      no tags with that name
                    </div>
                  )}

                  {availableTags.map((tag) => {
                    const checked = selectedTags.includes(tag.name);
                    const disabled =
                      !checked && selectedTags.length >= MAX_TAG_FILTERS;

                    return (
                      <label
                        key={tag.id}
                        title={tag.name}
                        className={`flex items-center gap-2 text-zinc-600 dark:text-zinc-400 truncate ${
                          disabled ? "" : "cursor-pointer"
                        }`}
                      >
                        <input
                          className={`accent-(--glitch-green) ${
                            disabled ? "" : "cursor-pointer"
                          }`}
                          type="checkbox"
                          checked={checked}
                          disabled={disabled}
                          onChange={() =>
                            setSelectedTags((prev) =>
                              checked
                                ? prev.filter((t) => t !== tag.name)
                                : [...prev, tag.name]
                            )
                          }
                        />
                        {tag.name}
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClear}
              className="text-xs sm:text-sm btn-neutral"
            >
              clear
            </button>

            <button onClick={onApply} className={`btn-glitch-green-2`}>
              apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
