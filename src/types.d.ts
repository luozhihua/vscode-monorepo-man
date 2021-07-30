import type {
  QuickPickItem,
  Uri
} from "vscode";

interface WorkspaceFolderItem extends QuickPickItem {
  root: Uri;
  isRoot: boolean;
  description: string;
}
