// Learn addresses, pointer initialization, dereferencing, reassignment,
// and the difference between passing a value and passing its address.
#include <iostream>

void change_copy(int value) {
    value = 99;
    std::cout << "Inside change_copy: " << value << '\n';
}

void change_target(int* value) {
    // A pointer parameter can be null; check before dereferencing it.
    if (value != nullptr) {
        *value = 99;
    } else {
        std::cout << "Null argument: no value to modify.\n";
    }
}

int main() {
    std::cout << "=== Section 1: Variables and addresses ===\n";
    int apples = 10;
    int oranges = 20;
    std::cout << "apples = " << apples << ", address = " << &apples << '\n';
    std::cout << "oranges = " << oranges << ", address = " << &oranges << '\n';
    // Addresses vary between executions; do not rely on particular numbers.

    std::cout << "\n=== Section 2: Declaration and initialization ===\n";
    int* fruit_pointer = nullptr; // Never leave a pointer uninitialized.
    std::cout << std::boolalpha << "Initially null: "
              << (fruit_pointer == nullptr) << '\n';
    fruit_pointer = &apples;
    std::cout << "Pointer now stores " << fruit_pointer << '\n';
    /* Local storage (conceptual):
       fruit_pointer [address of apples] ----> apples [10]
       The pointer stores an address, not a separate copy of apples.
    */

    std::cout << "\n=== Section 3: Reading and writing through a pointer ===\n";
    std::cout << "*fruit_pointer = " << *fruit_pointer << '\n';
    *fruit_pointer = 15;
    std::cout << "After *fruit_pointer = 15, apples = " << apples << '\n';

    std::cout << "\n=== Section 4: Reassigning the pointer ===\n";
    fruit_pointer = &oranges; // Changes the address, not the previous target.
    *fruit_pointer = 25;
    std::cout << "apples = " << apples << ", oranges = " << oranges << '\n';
    // These pointers borrow local variables. Do not delete them or return
    // their addresses from this function: the variables die at scope exit.

    std::cout << "\n=== Section 5: Value versus pointer parameters ===\n";
    change_copy(apples);
    std::cout << "After change_copy, apples = " << apples << " (unchanged)\n";
    change_target(&apples);
    std::cout << "After change_target, apples = " << apples << '\n';
    change_target(nullptr);
    fruit_pointer = nullptr; // No target; dereferencing now would be invalid.
}

// Takeaways: & obtains an address; * accesses its target. Reassignment changes
// the target. A pointer parameter is itself copied, but can modify the pointee.
// Check null pointers and ensure every pointee outlives accesses through it.
