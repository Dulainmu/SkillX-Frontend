import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  getAllQuizzes,
  createQuiz,
  updateQuiz,
  deleteQuiz
} from '@/api/adminApi';

interface Question {
  id: string;
  type: string;
  question: string;
  options: string[];
  correctAnswer: string | string[];
  explanation?: string;
  tags?: string[];
  difficulty?: string;
}

interface Quiz {
  id: string;
  title: string;
  skill: string;
  questions: Question[];
  passingScore: number;
}

const emptyQuestion: Question = {
  id: '',
  type: 'multiple-choice',
  question: '',
  options: ['', '', '', ''],
  correctAnswer: '',
  explanation: '',
  tags: [],
  difficulty: 'Beginner',
};

const emptyForm: Partial<Quiz> = {
  title: '',
  skill: '',
  questions: [],
  passingScore: 0,
};

const Quizzes: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<Quiz>>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch all quizzes
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllQuizzes();
      setQuizzes(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Open form for create or edit
  const openForm = (quiz?: Quiz) => {
    setForm(quiz ? { ...quiz } : { ...emptyForm, questions: [] });
    setEditingId(quiz ? quiz.id : null);
    setShowForm(true);
  };

  // Handle form input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Question handlers
  const addQuestion = () => {
    setForm(f => ({
      ...f,
      questions: [...(f.questions || []), { ...emptyQuestion, id: Math.random().toString(36).substr(2, 9) }],
    }));
  };
  const updateQuestion = (idx: number, updated: Partial<Question>) => {
    setForm(f => ({
      ...f,
      questions: (f.questions || []).map((q, i) => (i === idx ? { ...q, ...updated } : q)),
    }));
  };
  const removeQuestion = (idx: number) => {
    setForm(f => ({
      ...f,
      questions: (f.questions || []).filter((_, i) => i !== idx),
    }));
  };
  const moveQuestion = (from: number, to: number) => {
    if (!form.questions || to < 0 || to >= form.questions.length) return;
    const updated = [...form.questions];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setForm(f => ({ ...f, questions: updated }));
  };

  // Submit create or edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await updateQuiz(editingId, form);
      } else {
        await createQuiz(form);
      }
      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
      fetchData();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Failed to save quiz');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;
    setDeletingId(id);
    try {
      await deleteQuiz(id);
      fetchData();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Failed to delete quiz');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-2 md:px-0">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Quizzes</h1>
        <Button className="bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition" onClick={() => openForm()}>Create Quiz</Button>
      </div>
      {loading ? (
        <div className="text-center py-10 text-lg">Loading...</div>
      ) : error ? (
        <div className="text-center py-10 text-red-600">{error}</div>
      ) : (
        <Card className="overflow-x-auto shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-500 uppercase tracking-wider">Skill</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-500 uppercase tracking-wider">Questions</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-500 uppercase tracking-wider">Passing Score</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {quizzes.map((quiz) => (
                <tr key={quiz.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{quiz.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{quiz.skill}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{quiz.questions.length}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{quiz.passingScore}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Button variant="outline" className="mr-2" onClick={() => openForm(quiz)}>
                      Edit
                    </Button>
                    <Button variant="destructive" onClick={() => handleDelete(quiz.id)} disabled={deletingId === quiz.id}>
                      {deletingId === quiz.id ? 'Deleting...' : 'Delete'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl relative border border-gray-100">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
              onClick={() => setShowForm(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4">{editingId ? 'Edit' : 'Create'} Quiz</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  name="title"
                  value={form.title || ''}
                  onChange={handleChange}
                  required
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Skill</label>
                <input
                  name="skill"
                  value={form.skill || ''}
                  onChange={handleChange}
                  required
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Passing Score (%)</label>
                <input
                  name="passingScore"
                  type="number"
                  value={form.passingScore || 0}
                  onChange={handleChange}
                  required
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  min={0}
                  max={100}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Questions</label>
                <div className="space-y-4">
                  {(form.questions || []).map((q, idx) => (
                    <div key={q.id} className="border rounded p-4 bg-gray-50 mb-2">
                      <div className="flex gap-2 items-center mb-2">
                        <input
                          className="border rounded px-2 py-1 flex-1"
                          placeholder="Question text"
                          value={q.question}
                          onChange={e => updateQuestion(idx, { question: e.target.value })}
                        />
                        <select
                          value={q.type}
                          onChange={e => updateQuestion(idx, { type: e.target.value })}
                          className="border rounded px-2 py-1"
                        >
                          <option value="multiple-choice">Multiple Choice</option>
                          <option value="true-false">True/False</option>
                          <option value="code">Code</option>
                          <option value="short-answer">Short Answer</option>
                        </select>
                        <Button type="button" variant="outline" onClick={() => moveQuestion(idx, idx - 1)} disabled={idx === 0}>  </Button>
                        <Button type="button" variant="outline" onClick={() => moveQuestion(idx, idx + 1)} disabled={idx === (form.questions?.length || 0) - 1}>  </Button>
                        <Button type="button" variant="destructive" onClick={() => removeQuestion(idx)}>Remove</Button>
                      </div>
                      {/* Options for MCQ */}
                      {q.type === 'multiple-choice' && (
                        <div className="mb-2">
                          <label className="block text-xs font-medium mb-1">Options</label>
                          {(q.options || []).map((opt, oidx) => (
                            <div key={oidx} className="flex gap-2 mb-1">
                              <input
                                className="border rounded px-2 py-1 flex-1"
                                placeholder={`Option ${oidx + 1}`}
                                value={opt}
                                onChange={e => {
                                  const newOpts = [...(q.options || [])];
                                  newOpts[oidx] = e.target.value;
                                  updateQuestion(idx, { options: newOpts });
                                }}
                              />
                              <Button type="button" variant="outline" onClick={() => {
                                const newOpts = [...(q.options || [])];
                                newOpts.splice(oidx, 1);
                                updateQuestion(idx, { options: newOpts });
                              }}>Remove</Button>
                            </div>
                          ))}
                          <Button type="button" variant="outline" onClick={() => updateQuestion(idx, { options: [...(q.options || []), ''] })}>Add Option</Button>
                        </div>
                      )}
                      {/* Correct Answer */}
                      <div className="mb-2">
                        <label className="block text-xs font-medium mb-1">Correct Answer</label>
                        {q.type === 'multiple-choice' ? (
                          <select
                            value={q.correctAnswer as string}
                            onChange={e => updateQuestion(idx, { correctAnswer: e.target.value })}
                            className="border rounded px-2 py-1"
                          >
                            <option value="">Select...</option>
                            {(q.options || []).map((opt, oidx) => (
                              <option key={oidx} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : q.type === 'true-false' ? (
                          <select
                            value={q.correctAnswer as string}
                            onChange={e => updateQuestion(idx, { correctAnswer: e.target.value })}
                            className="border rounded px-2 py-1"
                          >
                            <option value="">Select...</option>
                            <option value="true">True</option>
                            <option value="false">False</option>
                          </select>
                        ) : (
                          <input
                            className="border rounded px-2 py-1 w-full"
                            value={q.correctAnswer as string}
                            onChange={e => updateQuestion(idx, { correctAnswer: e.target.value })}
                          />
                        )}
                      </div>
                      {/* Explanation, Tags, Difficulty */}
                      <div className="mb-2">
                        <label className="block text-xs font-medium mb-1">Explanation</label>
                        <input
                          className="border rounded px-2 py-1 w-full"
                          value={q.explanation || ''}
                          onChange={e => updateQuestion(idx, { explanation: e.target.value })}
                        />
                      </div>
                      <div className="mb-2">
                        <label className="block text-xs font-medium mb-1">Tags (comma separated)</label>
                        <input
                          className="border rounded px-2 py-1 w-full"
                          value={q.tags?.join(',') || ''}
                          onChange={e => updateQuestion(idx, { tags: e.target.value.split(',').map(t => t.trim()) })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Difficulty</label>
                        <select
                          value={q.difficulty || 'Beginner'}
                          onChange={e => updateQuestion(idx, { difficulty: e.target.value })}
                          className="border rounded px-2 py-1"
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                      </div>
                    </div>
                  ))}
                  <Button type="button" className="mt-2" onClick={addQuestion}>Add Question</Button>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} disabled={submitting}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition"
                  disabled={submitting}
                >
                  {submitting ? (editingId ? 'Saving...' : 'Creating...') : (editingId ? 'Save' : 'Create')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Quizzes;
