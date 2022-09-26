#!/usr/bin/env node

import * as fs from 'node:fs'
import * as path from 'node:path'
import { Command } from 'commander'
import express = require('express')
const packageJson = require('../package.json')

const define = <T, R>(value: T, f: (as: T) => R) => f(value)

const createServer = (publicDir: string, htmlFilename: string, port: number) =>
	new Promise<void>((resolve) => {
		const server = express()
		server.use(express.static(publicDir))
		server.get('/', (_req, res) => res.sendFile(path.join(publicDir, htmlFilename)))
		server.listen(port, resolve)
	})

new Command()
	.name(packageJson.displayName)
	.description(packageJson.description)
	.version(packageJson.version)
	.showHelpAfterError(true)
	.argument('<dir>', 'a directory based on current working directory which HTML file is in')
	.option(
		'-f --filename <filename>',
		'file name to host (include extension)',
		'index.html',
	)
	.option(
		'-p --port <port>',
		'port to listen',
		'3000',
	)
	.action((dir, { filename, port }) =>
		define(path.join(process.cwd(), dir), (computedDir) =>
			!fs.existsSync(path.join(dir, filename))
				? console.log(`${filename} was not found on ${computedDir}`)
				: createServer(computedDir, filename, parseInt(port))
						.then(() => console.log(`hosting ${filename}...`))
		)
	)
	.parse(process.argv)
