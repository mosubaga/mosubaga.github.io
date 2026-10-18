// Learn how std::string* stores the address of a string object and how to
// read, modify, and pass that object through a pointer.
#include <iostream>
#include <string>

void append_message(std::string* text) {
    if (text == nullptr) {
        std::cout << "No string supplied; skipping update.\n";
        return;
    }
    text->append(" through a pointer");
}

int main() {
    std::cout << "=== Section 1: Pointing to a std::string ===\n";
    std::string greeting = "Hello";
    std::string* text_pointer = &greeting;
    /* text_pointer [address of greeting] ---> greeting [std::string object]
       The pointer points to the string object, not directly to its characters.
    */
    std::cout << "String object address: " << text_pointer << '\n';
    std::cout << "String value via *: " << *text_pointer << '\n';

    std::cout << "\n=== Section 2: Reading and modifying the string ===\n";
    *text_pointer = "Hello, C++";
    text_pointer->append("!"); // Equivalent to (*text_pointer).append("!").
    std::cout << "Updated greeting: " << greeting << '\n';
    std::cout << "Length via ->: " << text_pointer->size() << '\n';
    // Index the string after dereferencing; text_pointer[0] is a whole string.
    std::cout << "First character: " << (*text_pointer)[0] << '\n';
    // Character indexing requires a valid index; this string is nonempty.

    std::cout << "\n=== Section 3: Reassigning a string pointer ===\n";
    std::string message = "Learning strings";
    text_pointer = &message;
    *text_pointer += " is useful";
    std::cout << "greeting: " << greeting << '\n';
    std::cout << "message: " << message << '\n';

    std::cout << "\n=== Section 4: Passing a pointer to a function ===\n";
    append_message(&message);
    std::cout << "After function call: " << message << '\n';
    append_message(nullptr); // The function checks before dereferencing.

    std::cout << "\n=== Section 5: Read-only access and nullptr ===\n";
    const std::string* read_only = &message;
    std::cout << "Read-only access: " << *read_only << '\n';
    // read_only->append("!"); // Error: cannot modify through a const pointer target.
    // The pointer itself can still be reassigned to another string object.
    read_only = &greeting;
    std::cout << "Read-only access after retargeting: " << *read_only << '\n';

    text_pointer = nullptr;
    if (text_pointer == nullptr) {
        std::cout << "Pointer is empty; do not dereference it.\n";
    }
    // Both strings are local objects: these pointers borrow them. Never delete
    // them, and never use their addresses after the objects leave scope.
    // std::string* differs from const char*: c_str() returns a character buffer
    // pointer. String modifications can invalidate pointers into that buffer.
}

// Takeaways: std::string* points to a string object. Use * to access the whole
// string and -> to call its methods. Check nullable pointers and keep their
// targets alive. Prefer a reference parameter when a string must be supplied.
