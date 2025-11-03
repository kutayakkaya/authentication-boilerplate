import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { useAuth } from "../auth-context";
import { registerSchema } from "../validations/auth-schemas";

type FormState = {
    email: string;
    password: string;
};

const RegisterPage = () => {
    const auth = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState<FormState>({ email: "", password: "" });
    const [submitting, setSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState<Partial<FormState>>({});
    const [serverError, setServerError] = useState<string | null>(null);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setServerError(null);
        setFormErrors({});

        const result = registerSchema.safeParse(form);
        if (!result.success) {
            const nextErrors: Partial<FormState> = {};
            result.error.issues.forEach((issue) => {
                const field = issue.path[0];
                if (field === "email" || field === "password") {
                    nextErrors[field] = issue.message;
                }
            });
            setFormErrors(nextErrors);
            return;
        }

        setSubmitting(true);
        try {
            await auth.register(result.data);
            navigate("/dashboard", { replace: true });
        } catch (error) {
            if (error instanceof AxiosError) {
                setServerError(error.response?.data?.message ?? "Unable to register.");
            } else {
                setServerError("Unable to register.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="page">
            <h1>Register</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Email
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={(event) =>
                            setForm((prev) => ({ ...prev, email: event.target.value }))
                        }
                        autoComplete="email"
                        required
                    />
                </label>
                {formErrors.email ? <div className="error">{formErrors.email}</div> : null}
                <label>
                    Password
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={(event) =>
                            setForm((prev) => ({ ...prev, password: event.target.value }))
                        }
                        autoComplete="new-password"
                        required
                    />
                </label>
                {formErrors.password ? <div className="error">{formErrors.password}</div> : null}
                <button type="submit" disabled={submitting}>
                    {submitting ? "Creating account..." : "Create account"}
                </button>
                {serverError ? <div className="error">{serverError}</div> : null}
            </form>
            <div className="link-row">
                <span>Already have an account?</span>
                <Link to="/login">Login</Link>
            </div>
        </div>
    );
};

export default RegisterPage;
