/*
 Copyright 2021 Colin Luo <mail@luozhihua.com>

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      https://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
import path from "path";
import { getWorkspace } from "ultra-runner";
import {
  commands,
  ExtensionContext,
  QuickPickItem,
  Uri,
  window,
  workspace as vscodeWorkspace,
} from "vscode";
import type { WorkspaceFolderItem } from "../types";

/**
 * 获取 Package EMOJI 图标
 * @param {String} root 根目录
 * @param {String} pkgRoot Package 目录
 * @returns {String} EMOJI 图标
 */
function getFolderEmoji(root: string, pkgRoot: string) {
  const config = vscodeWorkspace.getConfiguration("monorepoWorkspace.folders");
  if (root == pkgRoot) {return config.get<string>("prefix.root") || "";};
  const dir = path.relative(root, pkgRoot);

  // Use custom prefixes first
  const custom = config.get<{ regex: string; prefix: string }[]>("custom");
  if (custom?.length) {
    for (const c of custom) {
      if (c.prefix && c.regex && new RegExp(c.regex, "u").test(dir))
        {return c.prefix;};
    }
  }

  for (const type of ["apps", "libs", "tools"]) {
    const regex = config.get<string>(`regex.${type}`);
    const prefix = config.get<string>(`prefix.${type}`);
    if (regex && prefix && new RegExp(regex, "u").test(dir)) {return prefix;};
  }
  return config.get<string>("prefix.unknown") || "";
}

/**
 * 获取Monorepo中所有 Package
 * @param {Boolean} includeRoot
 * @returns
 */
export async function getPackageFolders(
  includeRoot = true
): Promise<WorkspaceFolderItem[] | undefined> {
  const cwd = vscodeWorkspace.workspaceFolders?.[0].uri.fsPath;
  if (cwd) {
    const workspace = await getWorkspace({
      cwd,
      includeRoot: true,
    });
    if (workspace) {
      const ret: WorkspaceFolderItem[] = [];
      if (includeRoot) {
        ret.push({
          label: `${getFolderEmoji(workspace.root, workspace.root)}${
            workspace.getPackageForRoot(workspace.root) || "root"
          }`,
          description: `${
            workspace.type[0].toUpperCase() + workspace.type.slice(1)
          } Workspace Root`,
          root: Uri.file(workspace.root),
          isRoot: true,
        });
      }
      ret.push(
        ...workspace
          .getPackages()
          .filter((p) => p.root !== workspace.root)
          .map((p) => {
            return {
              label: `${getFolderEmoji(workspace.root, p.root)}${p.name}`,
              description: `at ${path.relative(workspace.root, p.root)}`,
              root: Uri.file(p.root),
              isRoot: false,
            };
          })
          .sort((a, b) => a.root.fsPath.localeCompare(b.root.fsPath))
      );
      return ret;
    }
  }
}
