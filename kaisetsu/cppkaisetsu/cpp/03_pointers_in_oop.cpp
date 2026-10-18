// Learn member access, this, raw allocation, virtual dispatch, and pointers
// to class members. Raw ownership here is educational; prefer RAII in practice.
#include <iostream>
#include <new>
#include <string>

class Counter {
public:
    int value;

    explicit Counter(int initial = 0) : value(initial) {}

    Counter& set(int value) {
        this->value = value; // Distinguishes the member from the parameter.
        std::cout << "set on instance " << this << ": " << this->value << '\n';
        return *this; // Reference to current object enables chaining.
    }

    Counter& add(int amount) {
        this->value += amount;
        return *this;
    }

    void show() const { std::cout << "Counter value = " << value << '\n'; }
};

class Animal {
public:
    virtual void speak() const { std::cout << "Animal sound\n"; }
    virtual ~Animal() { std::cout << "Animal destructor\n"; }
};

class Dog : public Animal {
public:
    void speak() const override { std::cout << "Dog says woof\n"; }
    ~Dog() override { std::cout << "Dog destructor\n"; }
};

int main() {
    std::cout << "=== Section 1: Member access ===\n";
    Counter counter(5);
    Counter* counter_pointer = &counter;
    counter_pointer->show();
    (*counter_pointer).show(); // Equivalent member access syntax.
    std::cout << "Public property via ->: " << counter_pointer->value << '\n';

    std::cout << "\n=== Section 2: The this pointer and chaining ===\n";
    counter_pointer->set(10).add(3).show();

    std::cout << "\n=== Section 3: Raw dynamic allocation ===\n";
    /* Local pointer              Dynamic storage (often called heap)
       heap_counter [address] ---> Counter { value: 20 }
       Deleting the object does not automatically clear aliases to it.
    */
    // nothrow new returns nullptr on allocation failure. Ordinary new instead
    // throws std::bad_alloc. This simple constructor does not throw.
    Counter* heap_counter = new (std::nothrow) Counter(20);
    if (heap_counter != nullptr) {
        heap_counter->show();
        delete heap_counter; // Single-object new pairs with delete.
        heap_counter = nullptr; // Avoid using this pointer after destruction.
    } else {
        std::cout << "Single-object allocation failed.\n";
    }

    constexpr int array_count = 3;
    Counter* counters = new (std::nothrow) Counter[array_count];
    if (counters != nullptr) {
        for (int index = 0; index < array_count; ++index) {
            counters[index].set(index + 1).show();
        }
        delete[] counters; // Array new MUST pair with delete[].
        counters = nullptr;
    } else {
        std::cout << "Array allocation failed.\n";
    }
    // Never delete a stack object, delete twice, or access a deleted object.
    // Resetting one pointer does not fix other aliases: they would dangle.
    // Raw owners also risk leaks if an exception skips their cleanup.

    std::cout << "\n=== Section 4: Polymorphism through base pointers ===\n";
    Animal* animal = new (std::nothrow) Dog;
    if (animal != nullptr) {
        animal->speak(); // Dynamic dispatch selects Dog::speak.
        delete animal; // Virtual destructor runs Dog then Animal destruction.
        animal = nullptr;
    } else {
        std::cout << "Dog allocation failed.\n";
    }

    std::cout << "\n=== Section 5: Pointers to class members ===\n";
    int Counter::* data_member = &Counter::value;
    counter.*data_member = 50; // .* applies a member pointer to an object.
    std::cout << "Member via ->*: " << counter_pointer->*data_member << '\n';
    void (Counter::* member_function)() const = &Counter::show;
    (counter.*member_function)();
    (counter_pointer->*member_function)();
    // Member pointers need an instance; they are not ordinary addresses of
    // standalone variables/functions. Parentheses are needed for these calls.
}

// Takeaways: -> accesses an object through a pointer; this identifies that
// instance. Match new/delete and new[]/delete[]. Polymorphic deletion requires
// a virtual base destructor. Member pointers are applied with .* or ->*.
