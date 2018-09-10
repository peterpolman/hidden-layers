<template>
  <section class="section-users">
    <h1>{{ title }}</h1>
    <table v-if="users">
      <tr v-for="u of users">
        <td>{{ u.uid }}</td>
        <td>{{ u.createdAt }}</td>
      </tr>
    </table>
  </section>
</template>

<script>
import axios from 'axios';

export default {
  name: 'users',
  data () {
    return {
      title: "Overview",
      users: null
    }
  }
}
</script>

<style lang="scss">

table {
  background: #999999;
}

table td {
  border: 1px solid #333;
  padding: 1rem;
}

</style>
