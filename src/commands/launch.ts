import {commands, window,
  workspace as vscodeWorkspace,} from 'vscode';
import { WorkspaceFolderItem } from '../types';
import { getPackageFolders } from '../utils/util';

enum PackageAction {
  newWindow,
  currentWindow,
  workspaceFolder,
}

/**
 * 将文件夹添加到工作区
 * @param item WorkspaceFolderItem
 * @returns
 */
export function addWorkspaceFolder(item: WorkspaceFolderItem) {
  const folders = vscodeWorkspace.workspaceFolders;
  let start = 0;
  let deleteCount = 0;
  if (folders)
    {for (const folder of folders) {
      if (folder.uri == item.root) {
        // Nothing to update
        if (folder.name == item.label) {return;};
        deleteCount = 1;
        break;
      }
      start++;
    }}
  vscodeWorkspace.updateWorkspaceFolders(start, deleteCount, {
    name: item.label,
    uri: item.root,
  });
}

/**
 * 打开文件夹、Monorepo Package
 * @param action
 * @returns
 */
async function openPackage(action: PackageAction) {

  const items = await getPackageFolders();
  if (items) {
    const item = await window.showQuickPick(items, {
      canPickMany: false,
      matchOnDescription: true,
    });
    if (item) {
      switch (action) {
        case PackageAction.currentWindow:
          return commands.executeCommand("vscode.openFolder", item.root);
        case PackageAction.newWindow:
          return commands.executeCommand("vscode.openFolder", item.root, true);
        case PackageAction.workspaceFolder:
          addWorkspaceFolder(item);
          break;
      }
    }
  }
}


/**
 * 新窗口打开
 * @returns
 */
export async function openInNewWindow() {
  return openPackage(PackageAction.newWindow);
}
