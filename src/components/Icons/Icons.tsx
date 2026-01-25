import arrowLeftSvg from "./svg/arrow-left.svg";
import arrowRightSvg from "./svg/arrow-right.svg";
import closeSvg from "./svg/close.svg";
import filledSquareSvg from "./svg/filled-square.svg";
import crossMarkSvg from "./svg/cross-mark.svg";
import starSvg from "./svg/star.svg";
import undoSvg from "./svg/undo.svg";
import redoSvg from "./svg/redo.svg";
import resetSvg from "./svg/reset.svg";
import trashSvg from "./svg/trash.svg";
import copySvg from "./svg/copy.svg";
import saveSvg from "./svg/save.svg";
import linkSvg from "./svg/link.svg";
import downloadSvg from "./svg/download.svg";
import uploadSvg from "./svg/upload.svg";
import diceSvg from "./svg/dice.svg";
import folderSvg from "./svg/folder.svg";
import librarySvg from "./svg/library.svg";
import mergeSvg from "./svg/merge.svg";
import editSvg from "./svg/edit.svg";
import sparkleSvg from "./svg/sparkle.svg";
import grandmaSvg from "./svg/grandma.svg";
import notebookSvg from "./svg/notebook.svg";
import checkSvg from "./svg/check.svg";
import "./Icons.css";

interface IconProps {
  className?: string;
  alt?: string;
}

/** SVG icon components - edit the .svg files in ./svg/ to customize */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class -- AGENTS.md requires OOP, no loose functions
export class Icons {
  private constructor() {
    // Prevent instantiation - use static methods
  }

  static ArrowLeft({ className, alt = "Back" }: IconProps = {}) {
    return <img src={arrowLeftSvg} alt={alt} className={`icon ${className ?? ""}`} />;
  }

  static ArrowRight({ className, alt = "Next" }: IconProps = {}) {
    return <img src={arrowRightSvg} alt={alt} className={`icon ${className ?? ""}`} />;
  }

  static Close({ className, alt = "Close" }: IconProps = {}) {
    return <img src={closeSvg} alt={alt} className={`icon ${className ?? ""}`} />;
  }

  static FilledSquare({ className, alt = "Fill" }: IconProps = {}) {
    return <img src={filledSquareSvg} alt={alt} className={`icon ${className ?? ""}`} />;
  }

  static CrossMark({ className, alt = "Cross" }: IconProps = {}) {
    return <img src={crossMarkSvg} alt={alt} className={`icon ${className ?? ""}`} />;
  }

  static Star({ className, alt = "Star" }: IconProps = {}) {
    return <img src={starSvg} alt={alt} className={`icon ${className ?? ""}`} />;
  }

  static Undo({ className, alt = "Undo" }: IconProps = {}) {
    return <img src={undoSvg} alt={alt} className={`icon ${className ?? ""}`} />;
  }

  static Redo({ className, alt = "Redo" }: IconProps = {}) {
    return <img src={redoSvg} alt={alt} className={`icon ${className ?? ""}`} />;
  }

  static Reset({ className, alt = "Reset" }: IconProps = {}) {
    return <img src={resetSvg} alt={alt} className={`icon ${className ?? ""}`} />;
  }

  static Trash({ className, alt = "Delete" }: IconProps = {}) {
    return <img src={trashSvg} alt={alt} className={`icon ${className ?? ""}`} />;
  }

  static Copy({ className, alt = "Copy" }: IconProps = {}) {
    return <img src={copySvg} alt={alt} className={`icon ${className ?? ""}`} />;
  }

  static Save({ className, alt = "Save" }: IconProps = {}) {
    return <img src={saveSvg} alt={alt} className={`icon ${className ?? ""}`} />;
  }

  static Link({ className, alt = "Link" }: IconProps = {}) {
    return <img src={linkSvg} alt={alt} className={`icon ${className ?? ""}`} />;
  }

  static Download({ className, alt = "Download" }: IconProps = {}) {
    return <img src={downloadSvg} alt={alt} className={`icon ${className ?? ""}`} />;
  }

  static Upload({ className, alt = "Upload" }: IconProps = {}) {
    return <img src={uploadSvg} alt={alt} className={`icon ${className ?? ""}`} />;
  }

  static Dice({ className, alt = "Random" }: IconProps = {}) {
    return <img src={diceSvg} alt={alt} className={`icon ${className ?? ""}`} />;
  }

  static Folder({ className, alt = "Open" }: IconProps = {}) {
    return <img src={folderSvg} alt={alt} className={`icon ${className ?? ""}`} />;
  }

  static Library({ className, alt = "Library" }: IconProps = {}) {
    return <img src={librarySvg} alt={alt} className={`icon ${className ?? ""}`} />;
  }

  static Merge({ className, alt = "Merge" }: IconProps = {}) {
    return <img src={mergeSvg} alt={alt} className={`icon ${className ?? ""}`} />;
  }

  static Edit({ className, alt = "Edit" }: IconProps = {}) {
    return <img src={editSvg} alt={alt} className={`icon ${className ?? ""}`} />;
  }

  static Sparkle({ className, alt = "Custom" }: IconProps = {}) {
    return <img src={sparkleSvg} alt={alt} className={`icon ${className ?? ""}`} />;
  }

  static Grandma({ className, alt = "Grandma" }: IconProps = {}) {
    return <img src={grandmaSvg} alt={alt} className={`icon ${className ?? ""}`} />;
  }

  static Notebook({ className, alt = "Notebook" }: IconProps = {}) {
    return <img src={notebookSvg} alt={alt} className={`icon ${className ?? ""}`} />;
  }

  static Check({ className, alt = "Check" }: IconProps = {}) {
    return <img src={checkSvg} alt={alt} className={`icon ${className ?? ""}`} />;
  }
}
