// Learn const placement, bounded array arithmetic, double indirection,
// and function pointers used as callbacks.
#include <cstddef>
#include <iostream>

void print_number(int value) {
    std::cout << "Callback received " << value << '\n';
}

using Callback = void (*)(int);

void process(const int* values, std::size_t count, Callback callback) {
    // Contract: values refers to at least count elements when count > 0.
    if (values == nullptr || callback == nullptr) {
        return;
    }
    for (std::size_t index = 0; index < count; ++index) {
        callback(values[index]);
    }
}

int main() {
    std::cout << "=== Section 1: Const and pointers ===\n";
    int first = 10;
    int second = 20;
    const int* read_only = &first; // Can retarget, cannot write through it.
    read_only = &second;
    // *read_only = 30; // Error: pointee access is const.
    int* const fixed_pointer = &first; // Cannot retarget, can modify target.
    *fixed_pointer = 11;
    // fixed_pointer = &second; // Error: pointer itself is const.
    const int* const fixed_read_only = &second; // Neither operation allowed.
    std::cout << "Read-only target = " << *read_only
              << ", fixed pointer target = " << *fixed_pointer
              << ", fixed read-only target = " << *fixed_read_only << '\n';
    // const on a pointer's access does not make an originally mutable object
    // immutable: second can still be modified through another mutable alias.

    std::cout << "\n=== Section 2: Pointer arithmetic and arrays ===\n";
    int numbers[] = {3, 6, 9, 12};
    constexpr std::size_t count = sizeof(numbers) / sizeof(numbers[0]);
    int* cursor = numbers; // Array-to-pointer conversion gives first element.
    ++cursor; // Moves by one int, not one byte.
    std::cout << "After increment: " << *cursor << '\n';
    --cursor;
    std::cout << "After decrement: " << *cursor << '\n';
    int* end = numbers + count; // Valid one-past pointer, never dereference.
    const std::ptrdiff_t distance = end - cursor;
    std::cout << "Distance in elements: " << distance << '\n';
    for (std::size_t index = 0; index < count; ++index) {
        std::cout << "numbers[" << index << "] = " << numbers[index]
                  << ", *(numbers + index) = " << *(numbers + index) << '\n';
    }
    // An array is not a pointer: sizeof(numbers) is the whole array's size.
    // Arithmetic stays within this array or one-past it. Subtract pointers
    // only within the same array; never form a pointer beyond those bounds.

    std::cout << "\n=== Section 3: Pointers to pointers ===\n";
    int* target = &first;
    int** pointer_to_pointer = &target;
    /* pointer_to_pointer ---> target ---> first
       *pointer_to_pointer changes target; **pointer_to_pointer changes first.
    */
    **pointer_to_pointer = 42;
    std::cout << "After double dereference write, first = " << first << '\n';
    *pointer_to_pointer = &second;
    **pointer_to_pointer = 84;
    std::cout << "After retargeting, first = " << first
              << ", second = " << second << '\n';

    std::cout << "\n=== Section 4: Function pointers and callbacks ===\n";
    void (*function_pointer)(int) = &print_number;
    function_pointer(7);
    Callback callback = function_pointer; // Alias simplifies the syntax.
    process(numbers, count, callback);
    process(numbers, count, nullptr); // Missing callback is safely ignored.
    // Capturing lambdas need a different interface, e.g. std::function<void(int)>.
}

// Takeaways: const placement controls what can change. Pointer arithmetic is
// array-bounded. Double indirection can retarget a pointer. Function pointers
// hold callable addresses and enable reusable callback-based processing.
