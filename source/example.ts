
import {FileLogger} from "./index"

const logger = new FileLogger({logfile: "example.log", level: "silly"})

logger.error(new Error("an error occurred"))
logger.warn("heed my warning!")
logger.info("something informative")
logger.verbose("explaining what's happening verbosely")
logger.debug("information to help diagnose bugs")
logger.silly("obscenely fine-grained details")
