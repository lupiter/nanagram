import arrowLeftSvg from "./svg/arrow-left.svg";
import arrowRightSvg from "./svg/arrow-right.svg";
import closeSvg from "./svg/close.svg";
import filledSquareSvg from "./svg/filled-square.svg";
import crossMarkSvg from "./svg/cross-mark.svg";
import starFilledSvg from "./svg/star-filled.svg";
import starEmptySvg from "./svg/star-empty.svg";
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
import photoCornerSvg from "./svg/photo-corner.svg";
import logoSvg from "./svg/logo.svg";
import checkSvg from "./svg/check.svg";
import settingsSvg from "./svg/settings.svg";
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

  static StarFilled({ className, alt = "Star" }: IconProps = {}) {
    return <img src={starFilledSvg} alt={alt} className={`icon ${className ?? ""}`} />;
  }

  static StarEmpty({ className, alt = "Star" }: IconProps = {}) {
    return <img src={starEmptySvg} alt={alt} className={`icon ${className ?? ""}`} />;
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

  static PhotoCorner({ className, alt = "Your design" }: IconProps = {}) {
    return <img src={photoCornerSvg} alt={alt} className={`icon ${className ?? ""}`} />;
  }

  static Logo({ className, alt = "Nana Gram" }: IconProps = {}) {
    return <img src={logoSvg} alt={alt} className={`icon ${className ?? ""}`} />;
  }

  static Check({ className, alt = "Check" }: IconProps = {}) {
    return <img src={checkSvg} alt={alt} className={`icon ${className ?? ""}`} />;
  }

  static Settings({ className, alt = "Settings" }: IconProps = {}) {
    return <img src={settingsSvg} alt={alt} className={`icon ${className ?? ""}`} />;
  }
}
