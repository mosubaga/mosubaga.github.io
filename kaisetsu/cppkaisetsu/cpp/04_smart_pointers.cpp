// Learn RAII, exclusive/shared ownership, custom deleters, and weak references
// that break ownership cycles. No explicit delete is needed in main.
#include <iostream>
#include <memory>
#include <string>
#include <utility>

struct Resource {
    std::string name;
    explicit Resource(std::string label) : name(std::move(label)) {
        std::cout << "Acquired " << name << '\n';
    }
    ~Resource() { std::cout << "Released " << name << '\n'; }
    void use() const { std::cout << "Using " << name << '\n'; }
};

void share_resource(std::shared_ptr<Resource> resource) {
    // By-value deliberately takes an additional share of ownership.
    std::cout << "Inside function, owners = " << resource.use_count() << '\n';
    resource->use(); // Caller supplies a non-null shared_ptr in this example.
}

struct Node {
    std::string name;
    std::shared_ptr<Node> child; // Own the child.
    std::weak_ptr<Node> parent; // Observe the parent without owning it.
    explicit Node(std::string label) : name(std::move(label)) {}
    ~Node() { std::cout << "Destroyed node " << name << '\n'; }
};

int main() {
    std::cout << "=== Section 1: RAII and scope-based cleanup ===\n";
    {
        auto scoped_resource = std::make_unique<Resource>("scoped resource");
        scoped_resource->use();
        std::cout << "Leaving scope triggers automatic cleanup.\n";
    }
    // Resource Acquisition Is Initialization ties lifetime to an owner object.
    // Destruction also happens during exception unwinding, preventing the
    // leaks that arise when manual delete is skipped by an early exit.

    std::cout << "\n=== Section 2: unique_ptr exclusive ownership ===\n";
    auto original = std::make_unique<Resource>("exclusive resource");
    // auto copy = original; // Error: unique_ptr cannot be copied.
    auto owner = std::move(original);
    std::cout << std::boolalpha << "Original is empty after move: "
              << (original == nullptr) << '\n';
    owner->use(); // Never dereference the moved-from, empty original.
    auto values = std::make_unique<int[]>(3); // Value-initialized to zero.
    values[1] = 42;
    std::cout << "Smart array: " << values[0] << ", " << values[1]
              << ", " << values[2] << '\n';
    // unique_ptr<T[]> uses delete[] automatically; indexing must be in bounds.
    {
        auto deleter = [](Resource* resource) noexcept {
            std::cout << "Custom deleter invoked\n";
            delete resource;
        };
        // Explicit new here illustrates supplying a custom cleanup operation.
        std::unique_ptr<Resource, decltype(deleter)> custom(
            new Resource("custom cleanup resource"), deleter);
        custom->use();
    }
    // get() borrows a raw pointer; do not delete it or wrap it in a second owner.

    std::cout << "\n=== Section 3: shared_ptr shared ownership ===\n";
    auto shared = std::make_shared<Resource>("shared resource");
    std::cout << "Initial owners = " << shared.use_count() << '\n';
    {
        auto second_owner = shared;
        std::cout << "After copying, owners = " << shared.use_count() << '\n';
        share_resource(second_owner);
    }
    std::cout << "After inner scope, owners = " << shared.use_count() << '\n';
    shared.reset(); // Last owner releases the resource now.
    // use_count is illustrative, not a synchronization mechanism. Shared
    // ownership does not make concurrent access to the resource safe.

    std::cout << "\n=== Section 4: weak_ptr and ownership cycles ===\n";
    std::weak_ptr<Node> observer;
    {
        auto parent = std::make_shared<Node>("parent");
        auto child = std::make_shared<Node>("child");
        parent->child = child;
        child->parent = parent;
        observer = parent;
        /* Owning edge: parent --shared_ptr--> child
           Observing edge: child --weak_ptr--> parent
           If both edges owned, the reference counts could never reach zero
           after external owners disappear, leaking both objects.
        */
        std::cout << "Observer expired: " << observer.expired() << '\n';
        if (auto temporary_owner = child->parent.lock()) {
            std::cout << "Locked parent: " << temporary_owner->name << '\n';
        } // Temporary shared ownership ends here.
    } // Both nodes are destroyed: the weak back-reference cannot keep them alive.
    std::cout << "After scope, observer expired: " << observer.expired() << '\n';
    if (auto temporary_owner = observer.lock()) {
        std::cout << "Still alive: " << temporary_owner->name << '\n';
    } else {
        std::cout << "lock() returned empty; target no longer exists.\n";
    }
    // expired() is a snapshot. Use lock() and check its result before access;
    // lock() acquires ownership if the object is still alive.
}

// Takeaways: prefer make_unique for one owner, make_shared for shared lifetime,
// and weak_ptr for non-owning observation or cycle-breaking back-references.
// RAII makes resource release automatic; borrowed raw pointers still require
// lifetime discipline. Remaining unique owners clean up when main exits.
