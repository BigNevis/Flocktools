import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function IntroduccionPage() {
  return (
    <div className="fedpa-container space-y-6">
      <div className="space-y-2">
        <h1 className="fedpa-title">Bienvenido a Flocktools</h1>
        <p className="fedpa-text text-xl">
          La herramienta centralizada para las necesidades de Flock IT en los proyectos de nuestros clientes.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="fedpa-card">
          <CardHeader>
            <CardTitle className="text-primary">¿Qué es Flocktools?</CardTitle>
            <CardDescription className="text-muted-foreground">Una visión general de nuestra herramienta</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="fedpa-text">
              Flocktools es una plataforma integral diseñada para centralizar y optimizar todas las necesidades
              de Flock IT en los proyectos de nuestros clientes. Nuestro objetivo principal es facilitar y
              agilizar las acciones del equipo, mejorando la eficiencia y la colaboración en todas las etapas
              de los proyectos.
            </p>
          </CardContent>
        </Card>

        <Card className="fedpa-card">
          <CardHeader>
            <CardTitle className="text-primary">Objetivos Principales</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="fedpa-list">
              <li>
                <strong className="text-primary">Centralización de Recursos:</strong> Reunir toda la información y herramientas
                necesarias en un solo lugar, facilitando el acceso y la gestión.
              </li>
              <li>
                <strong className="text-primary">Documentación Eficiente:</strong> Proporcionar un sistema robusto para la lectura
                y creación de documentación, asegurando que todo el equipo esté siempre actualizado.
              </li>
              <li>
                <strong className="text-primary">Integración con IA:</strong> Ofrecer sincronización con sistemas de inteligencia
                artificial para potenciar la productividad y la toma de decisiones.
              </li>
              <li>
                <strong className="text-primary">Colaboración Mejorada:</strong> Fomentar una mejor comunicación y trabajo en
                equipo a través de herramientas integradas y flujos de trabajo optimizados.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="fedpa-card">
          <CardHeader>
            <CardTitle className="text-primary">Explora Flocktools</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="fedpa-text">
              Descubre cómo Flocktools puede ayudarte en tu trabajo diario y mejorar la eficiencia general de los proyectos.
              Explora las diferentes secciones para aprovechar al máximo esta herramienta.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

