import { fmtTime } from "../helpers.js";

export default function MessageCard({ message }) {
  return (
    <div className="msgcard">
      <div className="msghead">
        <b>{message.sender}</b>
        <small>{fmtTime(message.date)}</small>
      </div>
      <div className="msgtext">{message.text}</div>
    </div>
  );
}
