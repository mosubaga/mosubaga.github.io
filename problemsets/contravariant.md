Here is a 5-problem homework assignment on **Tensor Calculus: Covariant and Contravariant Tensors** designed for introductory undergraduate students.

---

# Homework Assignment: Tensor Calculus — Covariant and Contravariant Tensors

## Section 1: Basic Definitions and Notation

### Problem 1: Identifying Tensor Character and Index Placement

**Question:**  
In tensor calculus, a vector \\(\mathbf{V}\\) can be represented by its **contravariant components** \\(V^i\\) (written with an upper index) or its **covariant components** \\(V_i\\) (written with a lower index). 
1. State the prototype geometric object for a contravariant vector \\(V^i\\) and for a covariant vector \\(V_i\\).
2. Given the scalar field \\(\phi(x^1, x^2, x^3) = (x^1)^2 x^2 + 3 x^3\\) in 3-dimensional Euclidean space:
   * (a) Compute the gradient components \\(A_i = \frac{\partial \phi}{\partial x^i}\\) and identify whether \\(A_i\\) is contravariant or covariant.
   * (b) Write out explicitly the expansion of \\(A_i V^i\\) for \\(i \in \{1, 2, 3\}\\) using the Einstein summation convention.

**Required Solution Steps:**
1. State the prototypes for contravariant and covariant components.
2. Compute the three partial derivatives \\(\frac{\partial \phi}{\partial x^1}, \frac{\partial \phi}{\partial x^2}, \frac{\partial \phi}{\partial x^3}\\).
3. Expand the repeated index expression \\(A_i V^i\\) into a sum of 3 terms.

**Hint:**  
Remember that coordinate displacements \\(dx^i\\) are the prototype for contravariant vectors, while gradients \\(\frac{\partial \phi}{\partial x^i}\\) are the prototype for covariant vectors. An index appearing once as a superscript and once as a subscript implies summation over all dimensions.

**Sample Solution Format:**
> 1. Prototype contravariant vector: \\(dx^i\\); Prototype covariant vector: \\(\frac{\partial \phi}{\partial x^i}\\).
> 2. (a) \\(A_1 = \dots\\), \\(A_2 = \dots\\), \\(A_3 = \dots\\). The components \\(A_i\\) form a **covariant** vector.
>    (b) \\(A_i V^i = A_1 V^1 + A_2 V^2 + A_3 V^3 = \dots\\).

---

## Section 2: Coordinate Transformations

### Problem 2: Transformation Laws for Vectors

**Question:**  
Consider a transformation in \\(\mathbb{R}^2\\) from Cartesian coordinates \\((x^1, x^2) = (x, y)\\) to polar coordinates \\((\bar{x}^1, \bar{x}^2) = (r, \theta)\\), defined by \\(x = r \cos\theta\\) and \\(y = r \sin\theta\\).
1. Compute the Jacobian matrix elements \\(\frac{\partial x^j}{\partial \bar{x}^i}\\) and its inverse \\(\frac{\partial \bar{x}^i}{\partial x^j}\\).
2. Suppose a contravariant vector field in Cartesian coordinates is given by \\(V^j = (y, -x)^T = (x^2, -x^1)^T\\). Use the contravariant transformation law:
   \\[\bar{V}^i = V^j \frac{\partial \bar{x}^i}{\partial x^j}\\]
   to find the components \\(\bar{V}^1\\) and \\(\bar{V}^2\\) in polar coordinates.

**Required Solution Steps:**
1. Compute all four partial derivatives \\(\frac{\partial x}{\partial r}, \frac{\partial x}{\partial \theta}, \frac{\partial y}{\partial r}, \frac{\partial y}{\partial \theta}\\).
2. Invert the \\(2 \times 2\\) Jacobian matrix to obtain \\(\frac{\partial r}{\partial x}, \frac{\partial r}{\partial y}, \frac{\partial \theta}{\partial x}, \frac{\partial \theta}{\partial y}\\).
3. Apply the transformation law \\(\bar{V}^i = V^1 \frac{\partial \bar{x}^i}{\partial x^1} + V^2 \frac{\partial \bar{x}^i}{\partial x^2}\\) for \\(i=1,2\\).
4. Substitute \\(x = r \cos\theta\\) and \\(y = r \sin\theta\\) into the final expressions to express \\(\bar{V}^i\\) purely in terms of \\((r, \theta)\\).

**Hint:**  
Notice that in the contravariant transformation rule \\(\bar{V}^i = V^j \frac{\partial \bar{x}^i}{\partial x^j}\\), the target coordinate \\(\bar{x}^i\\) appears in the **numerator** of the partial derivative.

**Sample Solution Format:**
> 1. Jacobian matrix \\(J = \begin{pmatrix} \frac{\partial x}{\partial r} & \frac{\partial x}{\partial \theta} \\ \frac{\partial y}{\partial r} & \frac{\partial y}{\partial \theta} \end{pmatrix} = \begin{pmatrix} \cos\theta & -r\sin\theta \\ \sin\theta & r\cos\theta \end{pmatrix}\\).
> 2. Inverse matrix \\(J^{-1} = \begin{pmatrix} \frac{\partial r}{\partial x} & \frac{\partial r}{\partial y} \\ \frac{\partial \theta}{\partial x} & \frac{\partial \theta}{\partial y} \end{pmatrix} = \dots\\).
> 3. \\(\bar{V}^1 = V^1 \frac{\partial r}{\partial x} + V^2 \frac{\partial r}{\partial y} = \dots\\)
> 4. \\(\bar{V}^2 = V^1 \frac{\partial \theta}{\partial x} + V^2 \frac{\partial \theta}{\partial y} = \dots\\)

---

## Section 3: Metric Tensor Applications

### Problem 3: Index Raising and Lowering via the Metric Tensor

**Question:**  
In 2D polar coordinates \\((x^1, x^2) = (r, \theta)\\), the line element is given by \\(ds^2 = (dr)^2 + r^2 (d\theta)^2\\).
1. Write down the components of the covariant metric tensor \\(g_{ij}\\) and compute its inverse, the contravariant metric tensor \\(g^{ij}\\).
2. Given a contravariant vector with components \\(U^i = \left(1, \frac{1}{r}\right)^T\\):
   * (a) Calculate the associate covariant components \\(U_i\\) using index lowering: \\(U_i = g_{ij} U^j\\).
   * (b) Calculate the invariant magnitude squared \\(\|\mathbf{U}\|^2 = g_{ij} U^i U^j = U_i U^i\\).

**Required Solution Steps:**
1. Construct the \\(2 \times 2\\) matrix for \\(g_{ij}\\) from the line element \\(ds^2 = g_{11}(dx^1)^2 + 2g_{12}dx^1 dx^2 + g_{22}(dx^2)^2\\).
2. Invert \\(g_{ij}\\) to obtain \\(g^{ij}\\) such that \\(g_{ij} g^{jk} = \delta_i^k\\).
3. Lower the index on \\(U^i\\) by matrix-vector multiplication \\(U_i = g_{ij} U^j\\).
4. Compute the inner product \\(U_i U^i = U_1 U^1 + U_2 U^2\\).

**Hint:**  
For an orthogonal coordinate system, \\(g_{ij}\\) is diagonal. Raising or lowering indices simply multiplies or divides the component by the corresponding diagonal metric entry.

**Sample Solution Format:**
> 1. \\(g_{ij} = \begin{pmatrix} 1 & 0 \\ 0 & r^2 \end{pmatrix}\\), \\(g^{ij} = \begin{pmatrix} 1 & 0 \\ 0 & \frac{1}{r^2} \end{pmatrix}\\).
> 2. (a) \\(U_1 = g_{11} U^1 + g_{12} U^2 = \dots\\), \\(U_2 = g_{21} U^1 + g_{22} U^2 = \dots\\).  
>    (b) \\(\|\mathbf{U}\|^2 = U_1 U^1 + U_2 U^2 = \dots\\).

---

## Section 4: Index Manipulation and Contraction

### Problem 4: Tensor Contraction and the Kronecker Delta

**Question:**  
1. Let \\(T^i_j\\) be a mixed second-order tensor in an \\(n\\)-dimensional space. Show that contracting the indices (setting \\(j = i\\)) yields an invariant scalar \\(T^i_i = \text{Tr}(T)\\).
2. Evaluate the following algebraic expressions involving the Kronecker delta \\(\delta^i_j\\) and metric tensors in \\(n\\) dimensions:
   * (a) \\(\delta^i_i\\)
   * (b) \\(g_{ij} g^{jk} \delta^i_k\\)
   * (c) \\(A_i B_j g^{ij} - A^k B_k\\)

**Required Solution Steps:**
1. Write the transformation law for a mixed second-order tensor \\(\bar{T}^i_j = T^k_l \frac{\partial \bar{x}^i}{\partial x^k} \frac{\partial x^l}{\partial \bar{x}^j}\\).
2. Set \\(\bar{x}^j = \bar{x}^i\\), apply the chain rule \\(\frac{\partial \bar{x}^i}{\partial x^k} \frac{\partial x^l}{\partial \bar{x}^i} = \frac{\partial x^l}{\partial x^k} = \delta_k^l\\), and show that \\(\bar{T}^i_i = T^k_k\\).
3. Evaluate parts (a), (b), and (c) step-by-step using index substitution rules.

**Hint:**  
The contraction of a upper and lower index reduces the rank of a tensor by 2. The Kronecker delta acts as a substitution operator: \\(\delta^i_j V^j = V^i\\).

**Sample Solution Format:**
> 1. Transformation law: \\(\bar{T}^i_i = T^k_l \frac{\partial \bar{x}^i}{\partial x^k} \frac{\partial x^l}{\partial \bar{x}^i} = T^k_l \delta_k^l = T^k_k\\). Thus \\(\bar{T}^i_i = T^k_k\\), which is invariant.
> 2. (a) \\(\delta^i_i = \sum_{i=1}^n 1 = n\\).  
>    (b) \\(g_{ij} g^{jk} \delta^i_k = \delta_i^k \delta^i_k = \dots\\).  
>    (c) \\(A_i B_j g^{ij} - A^k B_k = \dots\\).

---

## Section 5: Basis Transformations and Dual Bases

### Problem 5: Covariant and Contravariant Basis Vectors

**Question:**  
In a 2D oblique affine coordinate system \\((x^1, x^2)\\), the position vector of a point is given by \\(\mathbf{r}(x^1, x^2) = x^1 \mathbf{i} + (x^1 + 2 x^2) \mathbf{j}\\), where \\(\{\mathbf{i}, \mathbf{j}\}\\) are standard orthonormal Cartesian basis vectors.
1. Calculate the covariant basis vectors \\(\mathbf{e}_1 = \frac{\partial \mathbf{r}}{\partial x^1}\\) and \\(\mathbf{e}_2 = \frac{\partial \mathbf{r}}{\partial x^2}\\) in terms of \\(\{\mathbf{i}, \mathbf{j}\}\\).
2. Compute the metric tensor components \\(g_{ij} = \mathbf{e}_i \cdot \mathbf{e}_j\\).
3. Find the contravariant (dual) basis vectors \\(\mathbf{e}^1\\) and \\(\mathbf{e}^2\\) using the relation \\(\mathbf{e}^i = g^{ij} \mathbf{e}_j\\).
4. Verify the orthogonality relation \\(\mathbf{e}_i \cdot \mathbf{e}^j = \delta_i^j\\) for all \\(i, j \in \{1, 2\}\\).

**Required Solution Steps:**
1. Compute the vector partial derivatives \\(\frac{\partial \mathbf{r}}{\partial x^1}\\) and \\(\frac{\partial \mathbf{r}}{\partial x^2}\\).
2. Form the matrix \\(g_{ij}\\) by taking dot products between \\(\mathbf{e}_1\\) and \\(\mathbf{e}_2\\).
3. Invert \\(g_{ij}\\) to get \\(g^{ij}\\).
4. Construct \\(\mathbf{e}^1 = g^{11}\mathbf{e}_1 + g^{12}\mathbf{e}_2\\) and \\(\mathbf{e}^2 = g^{21}\mathbf{e}_1 + g^{22}\mathbf{e}_2\\).
5. Compute the four dot products \\(\mathbf{e}_1 \cdot \mathbf{e}^1, \mathbf{e}_1 \cdot \mathbf{e}^2, \mathbf{e}_2 \cdot \mathbf{e}^1, \mathbf{e}_2 \cdot \mathbf{e}^2\\) and verify they equal \\(\delta_i^j\\).

**Hint:**  
The covariant basis vectors \\(\mathbf{e}_i\\) are tangent to the coordinate curves, while the contravariant/dual basis vectors \\(\mathbf{e}^i\\) are perpendicular to the coordinate surfaces and satisfy \\(\mathbf{e}_i \cdot \mathbf{e}^j = \delta_i^j\\).

**Sample Solution Format:**
> 1. \\(\mathbf{e}_1 = \frac{\partial \mathbf{r}}{\partial x^1} = 1\mathbf{i} + 1\mathbf{j}\\), \\(\mathbf{e}_2 = \frac{\partial \mathbf{r}}{\partial x^2} = 0\mathbf{i} + 2\mathbf{j}\\).
> 2. \\(g_{11} = \mathbf{e}_1 \cdot \mathbf{e}_1 = 2\\), \\(g_{12} = g_{21} = \mathbf{e}_1 \cdot \mathbf{e}_2 = 2\\), \\(g_{22} = \mathbf{e}_2 \cdot \mathbf{e}_2 = 4\\). Matrix \\(g_{ij} = \begin{pmatrix} 2 & 2 \\ 2 & 4 \end{pmatrix}\\).
> 3. \\(g^{ij} = (g_{ij})^{-1} = \frac{1}{4} \begin{pmatrix} 4 & -2 \\ -2 & 2 \end{pmatrix} = \begin{pmatrix} 1 & -1/2 \\ -1/2 & 1/2 \end{pmatrix}\\).
> 4. \\(\mathbf{e}^1 = 1\mathbf{e}_1 - \frac{1}{2}\mathbf{e}_2 = \dots\\), \\(\mathbf{e}^2 = -\frac{1}{2}\mathbf{e}_1 + \frac{1}{2}\mathbf{e}_2 = \dots\\).
> 5. Verification: \\(\mathbf{e}_1 \cdot \mathbf{e}^1 = \dots = 1\\), \\(\mathbf{e}_1 \cdot \mathbf{e}^2 = \dots = 0\\), etc..

---