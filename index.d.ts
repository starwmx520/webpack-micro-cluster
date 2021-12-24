
import { Plugin } from 'webpack'
import { IInjectOptions, Loader } from 'webpack-inject-plugin/dist/main'

export class Master extends Plugin {
  constructor(options: { masterId: string; injected?: Array<string | Loader | [string | Loader, IInjectOptions]> })
}

export class Worker extends Plugin {
  constructor(options: { masterId: string; workerId: string; entry?: string })
}
