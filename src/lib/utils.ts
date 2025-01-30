import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const useExpandableContent = (contentHeight: number) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [previewHeight, setPreviewHeight] = useState(contentHeight)
  const [shouldShowExpand, setShouldShowExpand] = useState(contentHeight > 300)

  useEffect(() => {
    setShouldShowExpand(contentHeight > 300)
  }, [contentHeight])

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
    setPreviewHeight(isExpanded ? 300 : contentHeight)
  }

  return {
    isExpanded,
    shouldShowExpand,
    previewHeight,
    toggleExpanded,
    contentHeight,
  }
}