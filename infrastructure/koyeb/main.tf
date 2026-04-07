resource "koyeb_app" "continuum" {
  name = "continuum" 
}

resource "koyeb_service" "continuum" {
  app_name = koyeb_app.continuum.name
  
  definition {
    name = var.service_name
    
    instance_types {
      type = var.instance_type
    }
    
    ports {
      port     = var.port
      protocol = "http"
    }
    
    routes {
      path = "/"
      port = var.port
    }
    
    scalings {
      min = 1
      max = 1
    }
    
    regions = [var.region]
    
    docker {
      image = var.docker_image
    }
    
    env {
      key   = "NODE_ENV"
      value = "production"
    }
    
    env {
      key   = "PORT"
      value = tostring(var.port)
    }
  }
  
  depends_on = [koyeb_app.continuum]
}

resource "koyeb_app" "blog_preview" {
  name = "continuum-preview"
}

resource "koyeb_service" "blog_preview" {
  app_name = koyeb_app.blog_preview.name
  
  definition {
    name = "${var.service_name}-preview"
    
    instance_types {
      type = var.instance_type
    }
    
    ports {
      port     = var.port
      protocol = "http"
    }
    
    routes {
      path = "/"
      port = var.port
    }
    
    scalings {
      min = 1
      max = 1
    }
    
    regions = [var.region]
    
    docker {
      image = var.docker_image_preview
    }
    
    env {
      key   = "NODE_ENV"
      value = "production"
    }
    
    env {
      key   = "PORT"
      value = tostring(var.port)
    }
  }
  
  depends_on = [koyeb_app.blog_preview]
}
