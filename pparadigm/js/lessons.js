const lessons = [
  {
    "id": "classes",
    "title": "Classes",
    "group": "oop",
    "desc": "A class defines the attributes and methods its objects will have. It is a blueprint; creating an instance gives you an actual object.",
    "analogy": "Think of a character template in a game. Every player follows the template, but gets their own name.",
    "focus": "Define the template, then create a player.",
    "code": {
      "Python": "class Player:\n    def __init__(self, name):\n        self.name = name\n\nplayer = Player(\"Kai\")\nprint(player.name)",
      "JavaScript": "class Player {\n  constructor(name) { this.name = name; }\n}\nconst player = new Player(\"Kai\");\nconsole.log(player.name);",
      "Java": "public class Main {\n    public static void main(String[] args) {\n        class Player {\n            String name;\n            Player(String name) { this.name = name; }\n        }\n        Player player = new Player(\"Kai\");\n        System.out.println(player.name);\n    }\n}",
      "C++": "#include <iostream>\n#include <string>\n#include <vector>\n#include <functional>\nusing namespace std;\nint main() {\n    struct Player { string name; };\n    Player player{\"Kai\"};\n    cout << player.name << \"\\n\";\n}"
    },
    "out": "Kai"
  },
  {
    "id": "objects",
    "title": "Objects",
    "group": "oop",
    "desc": "An object is a specific instance of a class. Separate objects can hold different data while sharing the same structure.",
    "analogy": "Two players use the same character template, but each has their own identity.",
    "focus": "Changing one object does not change the other.",
    "code": {
      "Python": "class Player:\n    def __init__(self, name): self.name = name\n\na = Player(\"Kai\")\nb = Player(\"Mia\")\na.name = \"Ren\"\nprint(a.name, b.name)",
      "JavaScript": "class Player {\n  constructor(name) { this.name = name; }\n}\nconst a = new Player(\"Kai\"), b = new Player(\"Mia\");\na.name = \"Ren\";\nconsole.log(a.name, b.name);",
      "Java": "public class Main {\n    public static void main(String[] args) {\n        class Player {\n            String name;\n            Player(String name) { this.name = name; }\n        }\n        Player a = new Player(\"Kai\"), b = new Player(\"Mia\");\n        a.name = \"Ren\";\n        System.out.println(a.name + \" \" + b.name);\n    }\n}",
      "C++": "#include <iostream>\n#include <string>\n#include <vector>\n#include <functional>\nusing namespace std;\nint main() {\n    struct Player { string name; };\n    Player a{\"Kai\"}, b{\"Mia\"};\n    a.name = \"Ren\";\n    cout << a.name << \" \" << b.name << \"\\n\";\n}"
    },
    "out": "Ren Mia"
  },
  {
    "id": "attributes",
    "title": "Attributes",
    "group": "oop",
    "desc": "Attributes store an object’s state: its current data values. Different languages also call these fields or properties.",
    "analogy": "A player’s score is state. It can change as the game progresses.",
    "focus": "Read and update the score stored on the object.",
    "code": {
      "Python": "class Player:\n    def __init__(self): self.score = 0\n\np = Player()\np.score += 10\nprint(p.score)",
      "JavaScript": "class Player { score = 0; }\nconst p = new Player();\np.score += 10;\nconsole.log(p.score);",
      "Java": "public class Main {\n    public static void main(String[] args) {\n        class Player { int score = 0; }\n        Player p = new Player();\n        p.score += 10;\n        System.out.println(p.score);\n    }\n}",
      "C++": "#include <iostream>\n#include <string>\n#include <vector>\n#include <functional>\nusing namespace std;\nint main() {\n    struct Player { int score = 0; };\n    Player p;\n    p.score += 10;\n    cout << p.score << \"\\n\";\n}"
    },
    "out": "10"
  },
  {
    "id": "methods",
    "title": "Methods",
    "group": "oop",
    "desc": "Methods are functions defined on a class. They describe behavior and can read or update an object’s state.",
    "analogy": "A player can earn points. The action belongs next to the score it changes.",
    "focus": "Call a method to perform an action.",
    "code": {
      "Python": "class Player:\n    def __init__(self): self.score = 0\n    def earn(self, points): self.score += points\n\np = Player()\np.earn(10)\nprint(p.score)",
      "JavaScript": "class Player {\n  score = 0;\n  earn(points) { this.score += points; }\n}\nconst p = new Player();\np.earn(10);\nconsole.log(p.score);",
      "Java": "public class Main {\n    public static void main(String[] args) {\n        class Player {\n            int score = 0;\n            void earn(int points) { score += points; }\n        }\n        Player p = new Player();\n        p.earn(10);\n        System.out.println(p.score);\n    }\n}",
      "C++": "#include <iostream>\n#include <string>\n#include <vector>\n#include <functional>\nusing namespace std;\nint main() {\n    struct Player {\n        int score = 0;\n        void earn(int points) { score += points; }\n    };\n    Player p;\n    p.earn(10);\n    cout << p.score << \"\\n\";\n}"
    },
    "out": "10"
  },
  {
    "id": "encapsulation",
    "title": "Encapsulation",
    "group": "oop",
    "desc": "Keep data and the operations that manage it together. Restrict direct access so callers use methods that enforce valid state. Python uses conventions rather than strict private fields.",
    "analogy": "A score counter accepts earned points, but rejects negative rewards.",
    "focus": "Java and C++ use private; JavaScript uses #; Python’s _ signals internal use.",
    "code": {
      "Python": "class Score:\n    def __init__(self): self._value = 0\n    def earn(self, points):\n        if points > 0: self._value += points\n    @property\n    def value(self): return self._value\n\ns = Score()\ns.earn(10)\ns.earn(-5)\nprint(s.value)",
      "JavaScript": "class Score {\n  #value = 0;\n  earn(points) { if (points > 0) this.#value += points; }\n  get value() { return this.#value; }\n}\nconst s = new Score();\ns.earn(10);\ns.earn(-5);\nconsole.log(s.value);",
      "Java": "public class Main {\n    public static void main(String[] args) {\n        class Score {\n            private int value = 0;\n            void earn(int points) { if (points > 0) value += points; }\n            int getValue() { return value; }\n        }\n        Score s = new Score();\n        s.earn(10); s.earn(-5);\n        System.out.println(s.getValue());\n    }\n}",
      "C++": "#include <iostream>\n#include <string>\n#include <vector>\n#include <functional>\nusing namespace std;\nint main() {\n    class Score {\n        int value = 0;\n    public:\n        void earn(int points) { if (points > 0) value += points; }\n        int getValue() const { return value; }\n    };\n    Score s;\n    s.earn(10); s.earn(-5);\n    cout << s.getValue() << \"\\n\";\n}"
    },
    "out": "10"
  },
  {
    "id": "abstraction",
    "title": "Abstraction",
    "group": "oop",
    "desc": "Expose a useful operation while hiding the details needed to perform it. An abstract class or interface can describe that operation without specifying its implementation.",
    "analogy": "Press play without needing to know how a music app decodes sound.",
    "focus": "The caller only needs the play operation.",
    "code": {
      "Python": "from abc import ABC, abstractmethod\n\nclass Audio(ABC):\n    @abstractmethod\n    def play(self): pass\n\nclass Song(Audio):\n    def play(self): return \"Playing song\"\n\ndef listen(audio): print(audio.play())\nlisten(Song())",
      "JavaScript": "// JavaScript uses a shared method convention here.\nclass Song {\n  play() { return \"Playing song\"; }\n}\nfunction listen(audio) { console.log(audio.play()); }\nlisten(new Song());",
      "Java": "public class Main {\n    public static void main(String[] args) {\n        interface Audio { String play(); }\n        class Song implements Audio {\n            public String play() { return \"Playing song\"; }\n        }\n        Audio audio = new Song();\n        System.out.println(audio.play());\n    }\n}",
      "C++": "#include <iostream>\n#include <string>\n#include <vector>\n#include <functional>\nusing namespace std;\nint main() {\n    struct Audio {\n        virtual string play() const = 0;\n        virtual ~Audio() = default;\n    };\n    struct Song : Audio {\n        string play() const override { return \"Playing song\"; }\n    };\n    Song song;\n    const Audio& audio = song;\n    cout << audio.play() << \"\\n\";\n}"
    },
    "out": "Playing song"
  },
  {
    "id": "inheritance",
    "title": "Inheritance",
    "group": "oop",
    "desc": "A subclass can reuse and extend behavior from a superclass. Use it for a meaningful “is a” relationship; composition is often better when one object simply uses another.",
    "analogy": "A mage is a player with an extra ability.",
    "focus": "The mage inherits the greet method.",
    "code": {
      "Python": "class Player:\n    def greet(self): return \"Hello, player!\"\n\nclass Mage(Player):\n    def cast(self): return \"Spark!\"\n\nm = Mage()\nprint(m.greet())\nprint(m.cast())",
      "JavaScript": "class Player { greet() { return \"Hello, player!\"; } }\nclass Mage extends Player { cast() { return \"Spark!\"; } }\nconst m = new Mage();\nconsole.log(m.greet());\nconsole.log(m.cast());",
      "Java": "public class Main {\n    public static void main(String[] args) {\n        class Player { String greet() { return \"Hello, player!\"; } }\n        class Mage extends Player { String cast() { return \"Spark!\"; } }\n        Mage m = new Mage();\n        System.out.println(m.greet());\n        System.out.println(m.cast());\n    }\n}",
      "C++": "#include <iostream>\n#include <string>\n#include <vector>\n#include <functional>\nusing namespace std;\nint main() {\n    struct Player { string greet() { return \"Hello, player!\"; } };\n    struct Mage : Player { string cast() { return \"Spark!\"; } };\n    Mage m;\n    cout << m.greet() << \"\\n\" << m.cast() << \"\\n\";\n}"
    },
    "out": "Hello, player!\nSpark!"
  },
  {
    "id": "polymorphism",
    "title": "Polymorphism",
    "group": "oop",
    "desc": "Use one operation with different implementations. Code can call the same interface while each object supplies its own behavior; a matching method name alone is not the whole idea.",
    "analogy": "Ask different instruments to play: a piano and a drum respond differently.",
    "focus": "The same call dispatches to the appropriate implementation.",
    "code": {
      "Python": "class Piano:\n    def play(self): return \"Plink\"\n\nclass Drum:\n    def play(self): return \"Boom\"\n\nfor instrument in [Piano(), Drum()]:\n    print(instrument.play())",
      "JavaScript": "class Piano { play() { return \"Plink\"; } }\nclass Drum { play() { return \"Boom\"; } }\nfor (const instrument of [new Piano(), new Drum()]) {\n  console.log(instrument.play());\n}",
      "Java": "public class Main {\n    public static void main(String[] args) {\n        interface Instrument { String play(); }\n        class Piano implements Instrument {\n            public String play() { return \"Plink\"; }\n        }\n        class Drum implements Instrument {\n            public String play() { return \"Boom\"; }\n        }\n        for (Instrument i : new Instrument[]{new Piano(), new Drum()})\n            System.out.println(i.play());\n    }\n}",
      "C++": "#include <iostream>\n#include <string>\n#include <vector>\n#include <functional>\nusing namespace std;\nint main() {\n    struct Instrument {\n        virtual string play() const = 0;\n        virtual ~Instrument() = default;\n    };\n    struct Piano : Instrument { string play() const override { return \"Plink\"; } };\n    struct Drum : Instrument { string play() const override { return \"Boom\"; } };\n    Piano p; Drum d;\n    for (const Instrument* i : vector<const Instrument*>{&p, &d})\n        cout << i->play() << \"\\n\";\n}"
    },
    "out": "Plink\nBoom"
  },
  {
    "id": "pure-functions",
    "title": "Pure functions",
    "group": "fp",
    "desc": "A pure function returns the same result for the same inputs and has no observable side effects. Reading changing global state, writing files, and making network calls break purity.",
    "analogy": "A points calculator returns a result without secretly changing your score.",
    "focus": "The calculation is pure; printing its result is a separate side effect.",
    "code": {
      "Python": "def double(x): return x * 2\n\nprint(double(4))\nprint(double(4))",
      "JavaScript": "const double = x => x * 2;\nconsole.log(double(4));\nconsole.log(double(4));",
      "Java": "public class Main {\n    public static void main(String[] args) {\n        java.util.function.IntUnaryOperator twice = x -> x * 2;\n        System.out.println(twice.applyAsInt(4));\n        System.out.println(twice.applyAsInt(4));\n    }\n}",
      "C++": "#include <iostream>\n#include <string>\n#include <vector>\n#include <functional>\nusing namespace std;\nint main() {\n    auto twice = [](int x) { return x * 2; };\n    cout << twice(4) << \"\\n\" << twice(4) << \"\\n\";\n}"
    },
    "out": "8\n8"
  },
  {
    "id": "immutability",
    "title": "Immutability",
    "group": "fp",
    "desc": "Immutable values cannot be changed after creation. Transform data by producing a new value. A constant variable binding does not automatically make the object it refers to immutable.",
    "analogy": "Create a new playlist instead of editing the original one everyone is using.",
    "focus": "Python uses tuples; Java uses an unmodifiable list. JS freezes a flat array; C++ keeps the source const. These are shallow guarantees.",
    "code": {
      "Python": "original = (1, 2, 3)\nupdated = original + (4,)\nprint(*original)\nprint(*updated)",
      "JavaScript": "const original = Object.freeze([1, 2, 3]);\nconst updated = Object.freeze([...original, 4]);\nconsole.log(...original);\nconsole.log(...updated);",
      "Java": "public class Main {\n    public static void main(String[] args) {\n        var original = java.util.List.of(1, 2, 3);\n        var copy = new java.util.ArrayList<>(original);\n        copy.add(4);\n        var updated = java.util.List.copyOf(copy);\n        System.out.println(String.join(\" \", original.stream().map(Object::toString).toList()));\n        System.out.println(String.join(\" \", updated.stream().map(Object::toString).toList()));\n    }\n}",
      "C++": "#include <iostream>\n#include <string>\n#include <vector>\n#include <functional>\nusing namespace std;\nint main() {\n    const vector<int> original{1, 2, 3};\n    auto copy = original;\n    copy.push_back(4);\n    const auto updated = copy;\n    for (size_t i=0; i<original.size(); ++i) cout << (i ? \" \" : \"\") << original[i];\n    cout << \"\\n\";\n    for (size_t i=0; i<updated.size(); ++i) cout << (i ? \" \" : \"\") << updated[i];\n    cout << \"\\n\";\n}"
    },
    "out": "1 2 3\n1 2 3 4"
  },
  {
    "id": "higher-order",
    "title": "First-class & higher-order functions",
    "group": "fp",
    "desc": "First-class functions can be stored, passed, and returned as values. A higher-order function accepts a function or returns one. Java represents this with functional interfaces.",
    "analogy": "Hand a calculator a rule, then ask it to apply that rule twice.",
    "focus": "applyTwice accepts a function as an argument.",
    "code": {
      "Python": "def apply_twice(fn, value): return fn(fn(value))\ndef add_one(x): return x + 1\n\nrule = add_one\nprint(apply_twice(rule, 3))",
      "JavaScript": "const applyTwice = (fn, value) => fn(fn(value));\nconst addOne = x => x + 1;\nconst rule = addOne;\nconsole.log(applyTwice(rule, 3));",
      "Java": "public class Main {\n    public static void main(String[] args) {\n        java.util.function.BiFunction<java.util.function.IntUnaryOperator, Integer, Integer>\n            applyTwice = (fn, value) -> fn.applyAsInt(fn.applyAsInt(value));\n        java.util.function.IntUnaryOperator addOne = x -> x + 1;\n        var rule = addOne;\n        System.out.println(applyTwice.apply(rule, 3));\n    }\n}",
      "C++": "#include <iostream>\n#include <string>\n#include <vector>\n#include <functional>\nusing namespace std;\nint main() {\n    auto applyTwice = [](function<int(int)> fn, int value) {\n        return fn(fn(value));\n    };\n    auto addOne = [](int x) { return x + 1; };\n    auto rule = addOne;\n    cout << applyTwice(rule, 3) << \"\\n\";\n}"
    },
    "out": "5"
  },
  {
    "id": "composition",
    "title": "Function composition",
    "group": "fp",
    "desc": "Build a larger transformation by connecting smaller functions. In compose(f, g), g runs first and f receives its result: f(g(x)).",
    "analogy": "A small assembly line: add one, then double the result.",
    "focus": "Order matters: double(addOne(3)) is 8, not 7.",
    "code": {
      "Python": "def compose(f, g): return lambda x: f(g(x))\ndef add_one(x): return x + 1\ndef double(x): return x * 2\n\ntransform = compose(double, add_one)\nprint(transform(3))",
      "JavaScript": "const compose = (f, g) => x => f(g(x));\nconst addOne = x => x + 1;\nconst double = x => x * 2;\nconst transform = compose(double, addOne);\nconsole.log(transform(3));",
      "Java": "public class Main {\n    public static void main(String[] args) {\n        java.util.function.Function<Integer, Integer> addOne = x -> x + 1;\n        java.util.function.Function<Integer, Integer> twice = x -> x * 2;\n        var transform = twice.compose(addOne);\n        System.out.println(transform.apply(3));\n    }\n}",
      "C++": "#include <iostream>\n#include <string>\n#include <vector>\n#include <functional>\nusing namespace std;\nint main() {\n    auto compose = [](auto f, auto g) {\n        return [f, g](int x) { return f(g(x)); };\n    };\n    auto addOne = [](int x) { return x + 1; };\n    auto twice = [](int x) { return x * 2; };\n    auto transform = compose(twice, addOne);\n    cout << transform(3) << \"\\n\";\n}"
    },
    "out": "8"
  },
  {
    "id": "recursion",
    "title": "Recursion over loops",
    "group": "fp",
    "desc": "Recursion solves a problem using smaller versions of itself. A base case stops the calls. It is common in functional programming, but loops and library transformations are also useful.",
    "analogy": "Sum a countdown: 4 + sum(3), until sum(0) returns 0.",
    "focus": "These small examples require a nonnegative integer. Deep recursion can exhaust the call stack in these languages; use loops or library operations for large inputs.",
    "code": {
      "Python": "def total(n):\n    if n == 0: return 0\n    return n + total(n - 1)\n\nprint(total(4))",
      "JavaScript": "function total(n) {\n  if (n === 0) return 0;\n  return n + total(n - 1);\n}\nconsole.log(total(4));",
      "Java": "public class Main {\n    public static void main(String[] args) {\n        class Sum {\n            int total(int n) {\n                if (n == 0) return 0;\n                return n + total(n - 1);\n            }\n        }\n        System.out.println(new Sum().total(4));\n    }\n}",
      "C++": "#include <iostream>\n#include <string>\n#include <vector>\n#include <functional>\nusing namespace std;\nint main() {\n    function<int(int)> total = [&](int n) {\n        if (n == 0) return 0;\n        return n + total(n - 1);\n    };\n    cout << total(4) << \"\\n\";\n}"
    },
    "out": "10"
  },
  {
    "id": "strategy-pattern",
    "title": "Strategy pattern",
    "group": "oop",
    "desc": "Define a family of interchangeable algorithms and let the caller choose one at runtime. Each strategy object implements the same interface, so the code that uses it never changes.",
    "analogy": "A map app lets you pick driving, walking, or cycling — the route calculation changes, but the button says the same thing: navigate.",
    "focus": "Swap the discount strategy without changing the order logic.",
    "code": {
      "Python": "class NoDiscount:\n    def apply(self, price): return price\n\nclass HalfOff:\n    def apply(self, price): return price * 0.5\n\nclass Order:\n    def __init__(self, price, strategy):\n        self.price = price\n        self.strategy = strategy\n\n    def total(self):\n        return self.strategy.apply(self.price)\n\nprint(Order(100, NoDiscount()).total())\nprint(Order(100, HalfOff()).total())",
      "JavaScript": "class NoDiscount {\n  apply(price) { return price; }\n}\nclass HalfOff {\n  apply(price) { return price * 0.5; }\n}\nclass Order {\n  constructor(price, strategy) {\n    this.price = price;\n    this.strategy = strategy;\n  }\n  total() { return this.strategy.apply(this.price); }\n}\nconsole.log(new Order(100, new NoDiscount()).total());\nconsole.log(new Order(100, new HalfOff()).total());",
      "Java": "public class Main {\n    interface Discount {\n        double apply(double price);\n    }\n    public static void main(String[] args) {\n        Discount none = price -> price;\n        Discount half = price -> price * 0.5;\n        class Order {\n            double price; Discount strategy;\n            Order(double p, Discount s) { price = p; strategy = s; }\n            double total() { return strategy.apply(price); }\n        }\n        System.out.println(new Order(100, none).total());\n        System.out.println(new Order(100, half).total());\n    }\n}",
      "C++": "#include <iostream>\n#include <functional>\nusing namespace std;\nint main() {\n    auto none = [](double p) { return p; };\n    auto half = [](double p) { return p * 0.5; };\n    struct Order {\n        double price;\n        function<double(double)> strategy;\n        double total() const { return strategy(price); }\n    };\n    cout << Order{100, none}.total() << \"\\n\";\n    cout << Order{100, half}.total() << \"\\n\";\n}"
    },
    "out": "100.0\n50.0"
  },
  {
    "id": "observer-pattern",
    "title": "Observer pattern",
    "group": "oop",
    "desc": "Let objects subscribe to events on another object so they are notified automatically when something changes. This decouples the subject from its listeners.",
    "analogy": "A group chat: when one person sends a message, everyone in the group sees it without the sender knowing who is listening.",
    "focus": "Add listeners, then notify them all at once.",
    "code": {
      "Python": "class EventBus:\n    def __init__(self): self._listeners = []\n    def subscribe(self, fn): self._listeners.append(fn)\n    def emit(self, data):\n        for fn in self._listeners: fn(data)\n\nbus = EventBus()\nbus.subscribe(lambda msg: print(f\"Logger: {msg}\"))\nbus.subscribe(lambda msg: print(f\"UI: {msg}\"))\nbus.emit(\"user signed in\")",
      "JavaScript": "class EventBus {\n  #listeners = [];\n  subscribe(fn) { this.#listeners.push(fn); }\n  emit(data) { this.#listeners.forEach(fn => fn(data)); }\n}\nconst bus = new EventBus();\nbus.subscribe(msg => console.log(`Logger: ${msg}`));\nbus.subscribe(msg => console.log(`UI: ${msg}`));\nbus.emit(\"user signed in\");",
      "Java": "import java.util.*;\nimport java.util.function.Consumer;\n\npublic class Main {\n    static class EventBus {\n        List<Consumer<String>> listeners = new ArrayList<>();\n        void subscribe(Consumer<String> fn) { listeners.add(fn); }\n        void emit(String data) { listeners.forEach(fn -> fn.accept(data)); }\n    }\n    public static void main(String[] args) {\n        var bus = new EventBus();\n        bus.subscribe(msg -> System.out.println(\"Logger: \" + msg));\n        bus.subscribe(msg -> System.out.println(\"UI: \" + msg));\n        bus.emit(\"user signed in\");\n    }\n}",
      "C++": "#include <iostream>\n#include <vector>\n#include <functional>\n#include <string>\nusing namespace std;\nint main() {\n    struct EventBus {\n        vector<function<void(const string&)>> listeners;\n        void subscribe(function<void(const string&)> fn) {\n            listeners.push_back(move(fn));\n        }\n        void emit(const string& data) {\n            for (auto& fn : listeners) fn(data);\n        }\n    };\n    EventBus bus;\n    bus.subscribe([](const string& m) { cout << \"Logger: \" << m << \"\\n\"; });\n    bus.subscribe([](const string& m) { cout << \"UI: \" << m << \"\\n\"; });\n    bus.emit(\"user signed in\");\n}"
    },
    "out": "Logger: user signed in\nUI: user signed in"
  },
  {
    "id": "closures",
    "title": "Closures",
    "group": "fp",
    "desc": "A closure is a function that remembers variables from the scope where it was created, even after that scope has ended. This is how functions carry private state without using a class.",
    "analogy": "A counter in your pocket: every time you click it the number goes up, but nobody else can see or reset the count.",
    "focus": "The returned function keeps access to count even after makeCounter finishes.",
    "code": {
      "Python": "def make_counter():\n    count = 0\n    def increment():\n        nonlocal count\n        count += 1\n        return count\n    return increment\n\ncounter = make_counter()\nprint(counter())\nprint(counter())\nprint(counter())",
      "JavaScript": "function makeCounter() {\n  let count = 0;\n  return () => {\n    count += 1;\n    return count;\n  };\n}\nconst counter = makeCounter();\nconsole.log(counter());\nconsole.log(counter());\nconsole.log(counter());",
      "Java": "import java.util.concurrent.atomic.AtomicInteger;\nimport java.util.function.IntSupplier;\n\npublic class Main {\n    static IntSupplier makeCounter() {\n        AtomicInteger count = new AtomicInteger(0);\n        return count::incrementAndGet;\n    }\n    public static void main(String[] args) {\n        var counter = makeCounter();\n        System.out.println(counter.getAsInt());\n        System.out.println(counter.getAsInt());\n        System.out.println(counter.getAsInt());\n    }\n}",
      "C++": "#include <iostream>\n#include <functional>\nusing namespace std;\nint main() {\n    auto makeCounter = []() {\n        int count = 0;\n        return [count]() mutable {\n            return ++count;\n        };\n    };\n    auto counter = makeCounter();\n    cout << counter() << \"\\n\";\n    cout << counter() << \"\\n\";\n    cout << counter() << \"\\n\";\n}"
    },
    "out": "1\n2\n3"
  },
  {
    "id": "map-filter-reduce",
    "title": "Map, filter, reduce",
    "group": "fp",
    "desc": "Three core operations for transforming collections without mutation. Map transforms each element, filter selects elements, and reduce combines them into a single result. Chaining them builds expressive data pipelines.",
    "analogy": "A conveyor belt: pick the ripe fruit (filter), peel each one (map), then squeeze them all into juice (reduce).",
    "focus": "Each step produces a new collection — the original stays untouched.",
    "code": {
      "Python": "prices = [12, 5, 8, 30, 3]\n\naffordable = [p for p in prices if p <= 10]\ndiscounted = [p * 0.9 for p in affordable]\ntotal = sum(discounted)\n\nprint(affordable)\nprint(discounted)\nprint(total)",
      "JavaScript": "const prices = [12, 5, 8, 30, 3];\n\nconst affordable = prices.filter(p => p <= 10);\nconst discounted = affordable.map(p => p * 0.9);\nconst total = discounted.reduce((sum, p) => sum + p, 0);\n\nconsole.log(affordable);\nconsole.log(discounted);\nconsole.log(total);",
      "Java": "import java.util.List;\n\npublic class Main {\n    public static void main(String[] args) {\n        var prices = List.of(12, 5, 8, 30, 3);\n\n        var affordable = prices.stream()\n            .filter(p -> p <= 10).toList();\n        var discounted = affordable.stream()\n            .map(p -> p * 0.9).toList();\n        double total = discounted.stream()\n            .reduce(0.0, Double::sum);\n\n        System.out.println(affordable);\n        System.out.println(discounted);\n        System.out.println(total);\n    }\n}",
      "C++": "#include <iostream>\n#include <vector>\n#include <numeric>\n#include <algorithm>\nusing namespace std;\nint main() {\n    vector<int> prices{12, 5, 8, 30, 3};\n\n    vector<int> affordable;\n    copy_if(prices.begin(), prices.end(),\n            back_inserter(affordable), [](int p) { return p <= 10; });\n\n    vector<double> discounted;\n    transform(affordable.begin(), affordable.end(),\n              back_inserter(discounted), [](int p) { return p * 0.9; });\n\n    double total = accumulate(discounted.begin(), discounted.end(), 0.0);\n\n    for (int p : affordable) cout << p << \" \";\n    cout << \"\\n\";\n    for (double d : discounted) cout << d << \" \";\n    cout << \"\\n\";\n    cout << total << \"\\n\";\n}"
    },
    "out": "[5, 8, 3]\n[4.5, 7.2, 2.7]\n14.4"
  },
  {
    "id": "error-handling",
    "title": "Error handling patterns",
    "group": "fp",
    "desc": "Instead of throwing exceptions everywhere, functional code often returns a value that represents success or failure. This makes error paths explicit and composable. Many languages support this with optionals, Result types, or similar patterns.",
    "analogy": "A vending machine that hands you a labeled box: either it contains your snack or a note explaining what went wrong.",
    "focus": "The caller checks the result instead of catching an exception.",
    "code": {
      "Python": "def parse_int(text):\n    try:\n        return (True, int(text))\n    except ValueError:\n        return (False, f\"not a number: {text}\")\n\nfor value in [\"42\", \"abc\"]:\n    ok, result = parse_int(value)\n    if ok:\n        print(f\"Got {result}\")\n    else:\n        print(f\"Error: {result}\")",
      "JavaScript": "function parseNum(text) {\n  const n = Number(text);\n  return Number.isNaN(n)\n    ? { ok: false, error: `not a number: ${text}` }\n    : { ok: true, value: n };\n}\nfor (const input of [\"42\", \"abc\"]) {\n  const result = parseNum(input);\n  if (result.ok) console.log(`Got ${result.value}`);\n  else console.log(`Error: ${result.error}`);\n}",
      "Java": "import java.util.Optional;\n\npublic class Main {\n    static Optional<Integer> parseNum(String text) {\n        try { return Optional.of(Integer.parseInt(text)); }\n        catch (NumberFormatException e) { return Optional.empty(); }\n    }\n    public static void main(String[] args) {\n        for (String input : new String[]{\"42\", \"abc\"}) {\n            parseNum(input).ifPresentOrElse(\n                n -> System.out.println(\"Got \" + n),\n                () -> System.out.println(\"Error: not a number: \" + input)\n            );\n        }\n    }\n}",
      "C++": "#include <iostream>\n#include <string>\n#include <optional>\nusing namespace std;\noptional<int> parseNum(const string& text) {\n    try { return stoi(text); }\n    catch (...) { return nullopt; }\n}\nint main() {\n    for (const auto& input : {\"42\", \"abc\"}) {\n        auto result = parseNum(input);\n        if (result) cout << \"Got \" << *result << \"\\n\";\n        else cout << \"Error: not a number: \" << input << \"\\n\";\n    }\n}"
    },
    "out": "Got 42\nError: not a number: abc"
  }
];
