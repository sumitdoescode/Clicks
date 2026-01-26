import React from "react";

const Container = ({ children }: { children: React.ReactNode }) => {
    return <div className="max-w-lg mx-auto px-2 container">{children}</div>;
};

export default Container;
