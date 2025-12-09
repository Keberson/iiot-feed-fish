import { useDispatch } from "react-redux";

import type { AppDispatch } from "#services/store.service";

const useAppDispatch = () => useDispatch<AppDispatch>();

export default useAppDispatch;
