# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e4]:
    - generic [ref=e7]:
      - generic [ref=e9]: M
      - heading "Marbella" [level=1] [ref=e10]
      - paragraph [ref=e11]: Sistema de Gestión de Cajas
      - paragraph [ref=e12]: Administra tus movimientos, controla tu caja y genera reportes de forma simple y eficiente.
    - generic [ref=e16]:
      - generic [ref=e17]:
        - heading "Iniciar Sesión" [level=2] [ref=e18]
        - paragraph [ref=e19]: Ingresá tus credenciales para acceder al sistema
      - generic [ref=e20]:
        - generic [ref=e22]:
          - generic [ref=e23]: RUT *
          - textbox "RUT *" [ref=e25]:
            - /placeholder: 12.345.678-9
        - generic [ref=e27]:
          - generic [ref=e28]: Contraseña *
          - generic [ref=e29]:
            - textbox "Contraseña *" [ref=e30]:
              - /placeholder: ••••••••
            - button "Mostrar contraseña" [ref=e31] [cursor=pointer]:
              - img [ref=e32]
        - generic [ref=e35]:
          - generic [ref=e36] [cursor=pointer]:
            - checkbox "Recordarme" [ref=e37]
            - generic [ref=e38]: Recordarme
          - link "¿Olvidaste tu contraseña?" [ref=e39] [cursor=pointer]:
            - /url: "#"
        - button "Iniciar Sesión" [disabled] [ref=e41]
      - paragraph [ref=e42]: Marbella © 2026. Todos los derechos reservados.
  - generic:
    - generic "Notificaciones"
```