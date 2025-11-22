import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { User } from "../types";
import toast from "react-hot-toast";

export function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    role: "STAFF",
  });
  const [isSaving, setIsSaving] = useState(false);

  async function fetchUsers() {
    try {
      setLoading(true);
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      setError("Falha ao carregar usuários.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  function startCreate() {
    setEditingUser(null);
    setForm({ nome: "", email: "", senha: "", role: "STAFF" });
  }

  function startEdit(user: User) {
    setEditingUser(user);
    setForm({ nome: user.nome, email: user.email, senha: "", role: user.role });
  }

  async function handleSave() {
    try {
      setIsSaving(true);
      if (editingUser) {
        // update
        const payload: any = {
          nome: form.nome,
          email: form.email,
          role: form.role,
        };
        if (form.senha) payload.senha = form.senha;
        const res = await api.put(`/users/${editingUser.id}`, payload);
        setUsers((prev) =>
          prev.map((u) => (u.id === editingUser.id ? res.data : u))
        );
        toast.success("Usuário atualizado.");
      } else {
        // create
        const payload: any = {
          nome: form.nome,
          email: form.email,
          senha: form.senha,
          role: form.role,
        };
        const res = await api.post(`/users`, payload);
        setUsers((prev) => [res.data, ...prev]);
        toast.success("Usuário criado.");
      }
      setEditingUser(null);
      setForm({ nome: "", email: "", senha: "", role: "STAFF" });
    } catch (err: any) {
      console.error(err);
      const message =
        err?.response?.data?.erro?.mensagem ||
        err?.response?.data?.message ||
        "Erro ao salvar.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Confirma exclusão deste usuário?")) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success("Usuário excluído.");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao excluir usuário.");
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Usuários</h1>
          <p className="mt-1 text-gray-600">
            Crie, edite e remova usuários (somente ADMIN).
          </p>
        </div>
        <div>
          <button
            onClick={startCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Novo Usuário
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded p-4 mb-6">
        <h2 className="font-semibold mb-2">Formulário</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            className="border p-2 rounded"
            placeholder="Nome"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
          />
          <input
            className="border p-2 rounded"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="border p-2 rounded"
            placeholder="Senha (deixe em branco para manter)"
            value={form.senha}
            onChange={(e) => setForm({ ...form, senha: e.target.value })}
          />
          <select
            className="border p-2 rounded"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="STAFF">STAFF</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
        <div className="mt-3">
          <button
            disabled={isSaving}
            onClick={handleSave}
            className="bg-green-600 text-white px-4 py-2 rounded mr-2"
          >
            {editingUser ? "Salvar" : "Criar"}
          </button>
          <button
            onClick={() => {
              setEditingUser(null);
              setForm({ nome: "", email: "", senha: "", role: "STAFF" });
            }}
            className="px-4 py-2 rounded border"
          >
            Cancelar
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading && (
              <tr>
                <td colSpan={4} className="text-center py-4">
                  Carregando...
                </td>
              </tr>
            )}
            {error && (
              <tr>
                <td colSpan={4} className="text-center py-4 text-red-500">
                  {error}
                </td>
              </tr>
            )}
            {!loading &&
              users.map((u) => (
                <tr key={u.id}>
                  <td className="px-6 py-4">{u.nome}</td>
                  <td className="px-6 py-4">{u.email}</td>
                  <td className="px-6 py-4">{u.role}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => startEdit(u)}
                      className="text-blue-600 mr-3"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="text-red-600"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminUsers;
