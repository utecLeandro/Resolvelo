import { Controller, Get } from "@nestjs/common";

@Controller("test-imagenes")
export class TestImagenesController {
  @Get("test")
  getTest() {
    return { message: "Test Imagenes controller working!" };
  }
}
