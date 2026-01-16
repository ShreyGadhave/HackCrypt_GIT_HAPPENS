import { useDispatch, useSelector } from "react-redux";

// Create typed hooks for better development experience
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;
