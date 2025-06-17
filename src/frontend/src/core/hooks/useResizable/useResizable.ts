import { useEffect, useRef, useState } from "react";

export default () => {
    const ref = useRef<HTMLElement>(null);
    const [height, setHeight] = useState(0);

    useEffect(() => {
        const updateHeight = () => {
            setHeight(ref.current?.clientHeight || 0);
        };

        window.addEventListener("resize", updateHeight);
        updateHeight();

        return () => {
            window.removeEventListener("resize", updateHeight);
        };
    }, []);

    return { ref, height };
};
