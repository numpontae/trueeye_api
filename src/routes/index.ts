import { ct } from "./ct.routes";
import { register } from "./register.routes"
import { oldpatient } from "./oldpatient.routes"
import { auth } from "./auth.routes"
import { screening } from "./screeing.routes"
import { consent } from "./consent.routes";
import { patient } from "./patient.routes";
export class Routes {
  constructor(private app: any) {
    this.app = app;
  }

  setRoutes() {
    const prefix = "/api/v1";
    this.app.use(prefix + "/ct", ct);
    this.app.use(prefix + "/register", register);
    this.app.use(prefix + "/oldpatient", oldpatient);
    this.app.use(prefix + "/auth", auth);
    this.app.use(prefix + "/screening", screening);
    this.app.use(prefix + "/consent", consent);
    this.app.use(prefix + "/patient", patient);
  }
}
