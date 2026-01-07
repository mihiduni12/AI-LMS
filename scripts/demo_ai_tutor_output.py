from textwrap import fill

def wrap(text, width=90):
    return "\n".join(fill(line, width=width) for line in text.split("\n"))

def generate_ai_tutor_answer(question: str) -> str:
    body = []

    # Show question (like chat UI where user question is visible)
    body.append("Question:")
    body.append(wrap(question))
    body.append("")

    # 1) THEORY
    body.append("1) THEORY (Key idea + definitions)")
    body.append(wrap(
        "Newton’s First Law (Law of Inertia) states: A body remains at rest or continues moving "
        "with uniform velocity in a straight line unless a net external force acts on it.\n"
        "Inertia is the tendency of a body to resist any change in its state of rest or uniform motion."
    ))
    body.append("")

    # 2) EQUATIONS
    body.append("2) EQUATIONS (symbols + units)")
    body.append(wrap(
        "Net force: ΣF  (unit: newton, N)\n"
        "Newton’s Second Law: ΣF = ma\n"
        "If ΣF = 0 N, acceleration a = 0 m s⁻²\n"
        "When acceleration is zero, velocity v remains constant (unit: m s⁻¹)."
    ))
    body.append("")

    # 3) METHOD / EXPLANATION
    body.append("3) METHOD / EXPLANATION (step-by-step)")
    body.append(wrap(
        "Step 1: Identify all forces acting on the object (weight, normal reaction, friction, tension, etc.).\n"
        "Step 2: Find the resultant (net) force by vector addition.\n"
        "Step 3: If the forces balance, the net force ΣF becomes zero.\n"
        "Step 4: From ΣF = ma, when ΣF = 0, acceleration a = 0.\n"
        "Step 5: Zero acceleration means there is no change in velocity, so the object remains at rest or "
        "continues to move with constant velocity in a straight line."
    ))
    body.append("")

    # 4) FINAL RESULT
    body.append("4) FINAL RESULT")
    body.append(wrap(
        "Condition for no change of motion:\n"
        "ΣF = 0  ⇒  a = 0  ⇒  v = constant\n"
        "Therefore, without a net external force, the state of motion of a body does not change."
    ))
    body.append("")

    # 5) PRACTICAL EXAMPLES
    body.append("5) PRACTICAL / REAL-WORLD EXAMPLES")
    body.append(wrap(
        "Example 1 (Bus): When a bus stops suddenly, passengers tend to move forward because their bodies "
        "try to continue in motion due to inertia.\n"
        "Example 2 (Car seat belt): Seat belts provide the external force needed to stop passengers safely "
        "during sudden braking.\n"
        "Example 3 (Tablecloth trick): If a tablecloth is pulled quickly, dishes tend to remain in place "
        "because of inertia."
    ))

    return "\n".join(body)

if __name__ == "__main__":
    question = "Explain Newton’s First Law of Motion"
    print(generate_ai_tutor_answer(question))
