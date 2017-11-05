
import {FileLogger} from "./index"

const logger = new FileLogger({level: "silly", logfile: "example.log"})

logger.error(new Error("example error occurred"))
logger.warn("heed my warning")
logger.info("example info")
logger.verbose("sample verbose")
logger.debug("example debug")
logger.silly("sample silly")
