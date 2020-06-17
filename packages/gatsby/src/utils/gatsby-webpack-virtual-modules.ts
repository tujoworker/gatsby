import VirtualModulesPlugin from "webpack-virtual-modules"

interface IGatsbyWebpackVirtualModulesContext {
  writeModule: VirtualModulesPlugin["writeModule"]
}

const fileContentLookup: Record<string, string> = {}
const instances: IGatsbyWebpackVirtualModulesContext[] = []

export class GatsbyWebpackVirtualModules {
  apply(compiler): void {
    const virtualModules = new VirtualModulesPlugin(fileContentLookup)
    virtualModules.apply(compiler)
    instances.push({
      writeModule: virtualModules.writeModule.bind(virtualModules),
    })
  }
}

export function writeModule(filePath: string, fileContents: string): void {
  // "node_modules" added in front of filePath allow to allow importing
  // those modules using same path
  const adjustedFilePath = `node_modules/${filePath}`

  if (fileContentLookup[adjustedFilePath] === fileContents) {
    // we already have this, no need to cause invalidation
    return
  }

  fileContentLookup[adjustedFilePath] = fileContents

  instances.forEach(instance => {
    instance.writeModule(adjustedFilePath, fileContents)
  })
}
