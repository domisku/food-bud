import { Link } from "@solidjs/router";
import { Component } from "solid-js";

interface IBacklinkProps {
  children: any;
  class?: string;
  href?: string;
}

const Backlink: Component<IBacklinkProps> = (props) => {
  return (
    <Link
      class={`flex gap-2 items-center text-black no-underline hover:underline w-min ${props.class}`}
      href={props.href || "/"}
    >
      <img
        src="/assets/down-chevron.png"
        alt=""
        class="transform rotate-90 h-3 w-3"
      />
      {props.children}
    </Link>
  );
};

export default Backlink;
