import { useParams } from "react-router-dom";

export default function PostDetails() {
  const { id } = useParams();

  return <h1>Viewing Post #{id}</h1>;
}