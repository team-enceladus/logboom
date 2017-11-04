
import {ConsoleLogger} from "./index"

const logger = new ConsoleLogger({loglevel: "silly"})

logger.error(new Error("example error occurred"))
logger.warn("heed my warning")
logger.info("example info")
logger.verbose("sample verbose")
logger.debug("example debug")
logger.silly("sample silly")
