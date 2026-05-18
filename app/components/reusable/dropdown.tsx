import { useState } from "react";
import { BiToggleLeft, BiToggleRight } from "react-icons/bi";
import { SidebarGroup } from "../../shared/ui/sidebar"
import { ListCheck } from "lucide-react";
export  function Dropdown(){
  const [isOpen, setIsOpen] = useState(false)
    return(
        <>
        <BiToggleLeft
        onClick={()=>setIsOpen(!isOpen)}
        
        />
        {isOpen && (
        <SidebarGroup to="/addTask"  icon={ListCheck}>
            Add Task
        </SidebarGroup>
        )}

        
        </>
    )

}