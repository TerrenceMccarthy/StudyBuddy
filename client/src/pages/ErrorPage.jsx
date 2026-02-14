import { useRouteError } from "react-router-dom";

export default function ErrorPage() {
	const error = useRouteError();
	return (
		<div style={{ padding: 16 }}>
			<h1>Oops — an error occurred</h1>
			<pre style={{ whiteSpace: "pre-wrap", color: "#900" }}>
				{String(error ?? "Unknown Error")}
			</pre>
		</div>
	);
}

