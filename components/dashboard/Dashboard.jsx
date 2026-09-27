"use client";
import StudentLifeApp from "./StudentLifeApp.jsx";
import { SplashScreen } from "../common/SplashScreen.jsx";
import { useMounted } from "../../hooks/useMounted.js";

export default function Dashboard() {
  const mounted = useMounted();
  return mounted ? <StudentLifeApp /> : <SplashScreen onFinish={() => {}} />;
}
