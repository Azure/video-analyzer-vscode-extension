import { createContext } from "react";

const AppContext = createContext({
    isHorizontal: false,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    toggleIsHorizontal: () => {}
});

export default AppContext;
