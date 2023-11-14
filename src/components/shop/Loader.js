import { css } from "@emotion/react";
import { ClipLoader } from "react-spinners";
import React from "react";
const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;
function Loader(props) {
  return (
    <div className="sweet-loading" style={{position: "absolute",
        top: "35vh",
        left: "40vw"}}>
      <ClipLoader css={override} size={150} />
    </div>
  );
}

export default Loader;