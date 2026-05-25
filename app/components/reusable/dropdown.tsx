import { useState } from "react";
import { SidebarGroup } from "./sidebar";

type Props = {
  OpenIcon: React.ElementType;
  CloseIcon: React.ElementType;
};

export function Dropdown({
  OpenIcon,
  CloseIcon,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-start justify-end">
        {isOpen ? (
          <OpenIcon
            onClick={() => setIsOpen(false)}
            className="cursor-pointer"
            size={20}
          />
        ) : (
          <CloseIcon
            onClick={() => setIsOpen(true)}
            className="cursor-pointer"
            size={20}
          />
        )}
      </div>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="flex justify-end">
          <SidebarGroup to="/addTask">
            Add Task
          </SidebarGroup>
        </div>
      )}
    </div>
  );
}