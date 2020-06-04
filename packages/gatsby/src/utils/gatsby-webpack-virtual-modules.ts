import VirtualModulesPlugin from "webpack-virtual-modules"
import { store } from "../redux"
import { slash } from "gatsby-core-utils"
import { Compiler } from "webpack"
import { IDependencyModule } from "../redux/types"

function generateExportCode({
  type,
  source,
  importName,
}: IDependencyModule): string {
  if (type === `default`) {
    return `export { default } from "${slash(source)}"`
  }

  if (type === `named`) {
    return `export { ${importName} as default } from "${slash(source)}"`
  }

  if (type === `namespace`) {
    return `export * from "${slash(source)}"`
  }

  throw new Error(`GatsbyPageDepsPlugin: Unsupported export type: \${type}`)
}

export class GatsbyWebpackVirtualModules {
  private plugin: { name: string }

  constructor() {
    this.plugin = { name: `GatsbyWebpackVirtualModules` }
  }

  apply(compiler: Compiler): void {
    const virtualModules = new VirtualModulesPlugin()

    virtualModules.apply(compiler)

    compiler.hooks.compilation.tap(this.plugin.name, function () {
      store.getState().modules.forEach(module => {
        virtualModules.writeModule(
          `node_modules/$virtual/modules/${module.moduleID}.js`,
          generateExportCode(module)
        )
      })
    })
  }
}
