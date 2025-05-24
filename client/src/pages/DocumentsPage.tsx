import { DocumentManager } from "../components/documents/DocumentManager";

export default function DocumentsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Document Management</h1>
      <DocumentManager />
    </div>
  );
}