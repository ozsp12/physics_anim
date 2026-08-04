# References

## Classical mechanics and vertical circular motion

1. J. R. Taylor, *Classical Mechanics*, University Science Books, 2005. Chapters 4 and 6.
2. D. Kleppner and R. Kolenkow, *An Introduction to Mechanics*, 2nd ed., Cambridge University Press, 2014. Sections on conservation of energy and constrained circular motion.
3. S. T. Thornton and J. B. Marion, *Classical Dynamics of Particles and Systems*, 5th ed., Brooks/Cole, 2004. Chapters on particle dynamics and oscillatory or constrained motion.
4. D. Halliday, R. Resnick, and J. Walker, *Fundamentals of Physics*, 11th ed., Wiley, 2018. Chapters on energy, circular motion, and Newton's laws.
5. R. P. Feynman, R. B. Leighton, and M. Sands, *The Feynman Lectures on Physics*, Vol. I, Addison-Wesley, 1963. Chapters 8–14.

## Numerical integration and scientific computation

6. W. H. Press, S. A. Teukolsky, W. T. Vetterling, and B. P. Flannery, *Numerical Recipes: The Art of Scientific Computing*, 3rd ed., Cambridge University Press, 2007.
7. M. Newman, *Computational Physics*, CreateSpace, 2013. Chapters on ordinary differential equations and numerical trajectories.
8. E. Hairer, C. Lubich, and G. Wanner, *Geometric Numerical Integration: Structure-Preserving Algorithms for Ordinary Differential Equations*, 2nd ed., Springer, 2006.

## Web standards used by the implementation

9. WHATWG, *HTML Living Standard*.
10. ECMA International, *ECMAScript Language Specification*.
11. World Wide Web Consortium, *Web Content Accessibility Guidelines (WCAG) 2.2*.

## Model note

For the `rollercoster_loop` project, the central threshold is derived from energy conservation and the nonnegativity of the normal reaction at the top of the loop. With the particle released from rest at height \(h\), measured from the loop bottom,

\[
v^2(\theta)=2g\left[h-R\left(1-\cos\theta\right)\right],
\]

and

\[
\frac{N}{m}=\frac{v^2}{R}+g\cos\theta.
\]

At the top, \(\theta=\pi\), the limiting-contact condition \(N=0\) yields \(v_{\mathrm{top}}^2=gR\). Combining the two relations gives

\[
h_{\min}=\frac{5R}{2}.
\]
