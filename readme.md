
# logboom — [![Build Status](https://travis-ci.org/team-enceladus/logboom.svg?branch=master)](https://travis-ci.org/team-enceladus/logboom)
## clearcut simple node logging

1. **install logboom locally** — `npm install logboom`

2. **import and instantiate a logger**

	```typescript
	import {FileLogger} from "logboom"

	const logger = new FileLogger({logfile: "example.log", level: "silly"})
	```

3. **do some logging**

	```typescript
	logger.error(new Error("an error occurred"))
	logger.warn("heed my warning!")
	logger.info("something informative")
	logger.verbose("explaining what's happening verbosely")
	logger.debug("information to help diagnose bugs")
	logger.silly("obscenely fine-grained details")
	```

4. **voila! color-coded console output**

	![logboom colored console output](https://github.com/team-enceladus/logboom/blob/master/example.png?raw=true)

5. **you also get a color-free `example.log` text file**

## notes

- the `ConsoleLogger` class writes to **stdout** and **stderr**

- the `FileLogger` is really double-logger  
	it extends the console logger and writes to the console — but also writes to a
	text file (with the colors stripped out)

- alternatively, you can just use the ConsoleLogger, and then redirect the
	stdout/stderr output with unix stuff:  
	`node myapp 2>&1 | tee -a example.log`  
	if that's not your jam, just use the file logger
