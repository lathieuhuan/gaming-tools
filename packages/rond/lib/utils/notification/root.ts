import ReactDOM from "react-dom/client";

const location = document.createElement("div");
location.id = "ron-notification";
document.body.append(location);

const notifRoot = ReactDOM.createRoot(location);

export { location, notifRoot };
