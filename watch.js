const process = require('process');
const { fork } = require('child_process');
const { watch, unwatchFile } = require('fs');
const runtimeFlag = '--runtime'
const logr = msg => console.log(`>> WATCH: ${msg}`)
let runtime;

function init() {
	if (process.argv.includes(runtimeFlag)) {
		const flagIndex = process.argv.indexOf('--runtime')
		const flagValue = process.argv[flagIndex + 1]
		
		runtime = flagValue
		logr(`Runtime file set to ${runtime}`)
	} else {
		console.error(`The ${runtimeFlag} and value is required`)
		process.exit(1)
	}
}

function main() {
	let instance = fork(runtime);
	logr('Server started');
	
	watch(runtime, (eventType, filename) => {
		instance.kill();
		instance = fork(runtime);
		logr(`Event triggered restart [type=${eventType}] [on=${filename}]`);
	});
	
	process.on('SIGINT', () => {
		instance.kill();
		unwatchFile(runtime);
		logr('Server stopped');
		process.exit();
	});
}

init()
main()