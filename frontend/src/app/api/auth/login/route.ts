import { NextRequest } from "next/server";
import { authenticateAgainstApi } from "../_session";

export const POST = (request: NextRequest) => authenticateAgainstApi(request, "login");
