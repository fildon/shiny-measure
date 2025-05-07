import * as React from "react";

export const H1 = (props: React.JSX.IntrinsicElements["h1"]) => (
  <h1
    className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl"
    {...props}
  />
);

export const H2 = (props: React.JSX.IntrinsicElements["h2"]) => (
  <h2
    className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0"
    {...props}
  />
);
